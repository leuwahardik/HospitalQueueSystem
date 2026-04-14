const cds = require('@sap/cds')

module.exports = cds.service.impl(async function () {
  const { Queue, Doctor, Diagnosis } = this.entities
  const DRAFT_QUEUE = 'HospitalService.Queue.drafts'

  const getNextTokenNumber = async (appointmentDate, doctor_ID, req, currentId) => {
    const tx = cds.tx(req)

    const rows = await tx.run(
      SELECT.from(Queue)
        .columns('ID', 'tokenNumber')
        .where({ appointmentDate, doctor_ID })
    )

    const tokens = rows
      .filter(row => row.ID !== currentId)
      .map(row => Number(row.tokenNumber) || 0)

    return (tokens.length ? Math.max(...tokens) : 0) + 1
  }

  const loadMergedData = async req => {
    let data = req.data

    if (data.ID) {
      const existing =
        (await cds.tx(req).run(SELECT.one.from(req.target).where({ ID: data.ID }))) ||
        (await cds.tx(req).run(SELECT.one.from(Queue).where({ ID: data.ID })))

      if (existing) data = { ...existing, ...data }
    }

    return data
  }

  const formatAppointmentWindow = row => {
    const start = row.startDateTime ? new Date(row.startDateTime) : null
    const end = row.endDateTime ? new Date(row.endDateTime) : null

    const datePart = row.appointmentDate || (start ? start.toISOString().slice(0, 10) : 'NoDate')
    const startPart = start ? start.toISOString().slice(11, 16) : '--:--'
    const endPart = end ? end.toISOString().slice(11, 16) : '--:--'
    const tokenPart = row.tokenNumber ? `#${row.tokenNumber}` : '#-'

    return `${datePart} ${startPart}-${endPart} ${tokenPart}`
  }

  const buildDoctorAppointmentsTag = async (req, data) => {
    if (!data.doctor_ID) {
      req.data.doctorAppointmentsTag = null
      data.doctorAppointmentsTag = null
      return
    }

    const rows = await cds.tx(req).run(
      SELECT.from(Queue)
        .columns('ID', 'appointmentDate', 'startDateTime', 'endDateTime', 'tokenNumber', 'status')
        .where({ doctor_ID: data.doctor_ID })
        .orderBy('appointmentDate desc', 'startDateTime desc')
    )

    const existingRows = rows.filter(row => row.ID !== data.ID)
    if (!existingRows.length) {
      req.data.doctorAppointmentsTag = 'No existing appointments for selected doctor'
      data.doctorAppointmentsTag = req.data.doctorAppointmentsTag
      return
    }

    const previewRows = existingRows.slice(0, 4).map(formatAppointmentWindow)
    const overflow = existingRows.length - previewRows.length
    const overflowSuffix = overflow > 0 ? ` +${overflow} more` : ''
    const tagSummary = `${previewRows.join(' | ')}${overflowSuffix}`

    req.data.doctorAppointmentsTag = tagSummary
    data.doctorAppointmentsTag = tagSummary
  }

  const getDoctorAppointmentsSummary = async (req, doctor_ID, currentQueueId) => {
    if (!doctor_ID) return 'Select a doctor first.'

    const rows = await cds.tx(req).run(
      SELECT.from(Queue)
        .columns('ID', 'appointmentDate', 'startDateTime', 'endDateTime', 'tokenNumber')
        .where({ doctor_ID })
        .orderBy('appointmentDate desc', 'startDateTime desc')
    )

    const existingRows = rows.filter(row => row.ID !== currentQueueId)
    if (!existingRows.length) return 'No existing appointments for selected doctor.'

    const previewRows = existingRows.slice(0, 6).map(formatAppointmentWindow)
    const overflow = existingRows.length - previewRows.length
    const overflowSuffix = overflow > 0 ? ` | +${overflow} more` : ''
    return `Existing slots: ${previewRows.join(' | ')}${overflowSuffix}`
  }

  const fillDerivedFields = async (req, data) => {
    const start = data.startDateTime ? new Date(data.startDateTime) : null
    let end = data.endDateTime ? new Date(data.endDateTime) : null

    if (start && !data.appointmentDate) {
      req.data.appointmentDate = start.toISOString().slice(0, 10)
      data.appointmentDate = req.data.appointmentDate
    }

    if (start && !data.endDateTime) {
      req.data.endDateTime = new Date(start.getTime() + 30 * 60 * 1000).toISOString()
      data.endDateTime = req.data.endDateTime
      end = new Date(req.data.endDateTime)
    }

    if (data.doctor_ID) {
      const doctor = await cds.tx(req).run(
        SELECT.one.from(Doctor).where({ ID: data.doctor_ID })
      )
      if (!doctor) req.reject(400, 'Selected doctor not found.')

      req.data.doctorName = doctor.doctorName
      req.data.specialty = doctor.specialty
      data.doctorName = doctor.doctorName
      data.specialty = doctor.specialty
    }

    return { data, start, end }
  }

  const validateQueue = (req, start, end) => {
    const now = new Date()
    if (!start) return

    if (start < now) req.reject(400, 'Appointment cannot be booked in the past.')
    if (end && end <= start) {
      req.reject(400, 'End date and time must be later than the start date and time.')
    }
  }

  const validateOverlap = async (req, data, start) => {
    if (!data.doctor_ID || !data.appointmentDate || !start || !data.endDateTime) return

    const rows = await cds.tx(req).run(
      SELECT.from(Queue)
        .columns('ID', 'startDateTime', 'endDateTime', 'status')
        .where({
          doctor_ID: data.doctor_ID,
          appointmentDate: data.appointmentDate
        })
    )

    const activeRows = rows.filter(row =>
      row.ID !== data.ID &&
      !['Cancelled', 'Completed'].includes(row.status)
    )

    const requestedStart = start.getTime()
    const requestedEnd = new Date(data.endDateTime).getTime()

    const overlapping = activeRows.some(row => {
      const existingStart = new Date(row.startDateTime).getTime()
      const existingEnd = new Date(row.endDateTime).getTime()
      return requestedStart < existingEnd && requestedEnd > existingStart
    })

    if (overlapping) {
      req.reject(409, 'Selected doctor already has an appointment in this time slot.')
    }
  }

  const processDraftQueue = async req => {
  if (!req.data.status) req.data.status = 'Pending'

  const merged = await loadMergedData(req)
  const { data } = await fillDerivedFields(req, merged)
  await buildDoctorAppointmentsTag(req, data)

  if (!data.tokenNumber && data.appointmentDate && data.doctor_ID) {
    req.data.tokenNumber = await getNextTokenNumber(
      data.appointmentDate,
      data.doctor_ID,
      req,
      data.ID
    )
    data.tokenNumber = req.data.tokenNumber
  }
}

  const processActiveQueue = async req => {
    if (!req.data.status) req.data.status = 'Pending'

    const merged = await loadMergedData(req)
    const { data, start, end } = await fillDerivedFields(req, merged)
    await buildDoctorAppointmentsTag(req, data)

    if (!data.tokenNumber && data.appointmentDate && data.doctor_ID) {
      req.data.tokenNumber = await getNextTokenNumber(
        data.appointmentDate,
        data.doctor_ID,
        req,
        data.ID
      )
      data.tokenNumber = req.data.tokenNumber
    }

    validateQueue(req, start, end)
    await validateOverlap(req, data, start)
  }

  // Draft: only light enrichment
  this.before('CREATE', DRAFT_QUEUE, processDraftQueue)
  this.before('UPDATE', DRAFT_QUEUE, processDraftQueue)

  // Active: full business logic
  this.before('CREATE', Queue, processActiveQueue)
  this.before('UPDATE', Queue, processActiveQueue)

  this.before('UPDATE', Queue, async req => {
    const existing = await cds.tx(req).run(
      SELECT.one.from(Queue).where({ ID: req.data.ID })
    )
    const newStatus = req.data.status

    if (!existing || !newStatus || existing.status === newStatus) return

    if (newStatus === 'InProgress' && !existing.consultationStartedAt) {
      req.data.consultationStartedAt = new Date().toISOString()
    }

    if (newStatus === 'Completed' && !existing.consultationEndedAt) {
      req.data.consultationEndedAt = new Date().toISOString()
    }
  })

  this.on('showDoctorAppointments', async req => {
    const doctor_ID = req.data?.doctor_ID
    const currentQueueId = req.data?.queue_ID || req.data?.ID
    const summary = await getDoctorAppointmentsSummary(req, doctor_ID, currentQueueId)
    req.notify(summary)
    return summary
  })

  this.before('CREATE', Diagnosis, async req => {
    const queue_ID = req.data.queue_ID
    if (!queue_ID) return

    const queue = await cds.tx(req).run(
      SELECT.one.from(Queue).columns(
        'patient_ID',
        'doctor_ID',
        'startDateTime',
        'endDateTime'
      ).where({ ID: queue_ID })
    )
    if (!queue) req.reject(400, 'Selected appointment not found for diagnosis.')

    if (!req.data.patient_ID) req.data.patient_ID = queue.patient_ID
    if (!req.data.doctor_ID) req.data.doctor_ID = queue.doctor_ID
    if (!req.data.startDateTime) req.data.startDateTime = queue.startDateTime
    if (!req.data.endDateTime) req.data.endDateTime = queue.endDateTime
  })
})
