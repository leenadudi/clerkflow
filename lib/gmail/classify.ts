export type EmailClassification =
  | 'records_request'
  | 'meeting_related'
  | 'permit_application'
  | 'resident_complaint'
  | 'board_related'
  | 'general_inquiry'
  | 'spam_or_vendor'

export type Confidence = 'high' | 'medium' | 'low'

export interface ClassificationResult {
  classification: EmailClassification
  confidence: Confidence
  summary: string
  shouldCreateRecord: boolean
}

const RULES: {
  classification: EmailClassification
  keywords: string[]
  shouldCreateRecord: boolean
}[] = [
  {
    classification: 'records_request',
    keywords: [
      'foia', 'public records', 'records request', 'open records',
      'freedom of information', 'request for records', 'request for documents',
      'records from', 'obtain records', 'copy of records', 'copy of the records',
      'public information request', 'government records', 'municipal records',
    ],
    shouldCreateRecord: true,
  },
  {
    classification: 'permit_application',
    keywords: [
      'permit', 'license', 'burn permit', 'business license', 'building permit',
      'sign permit', 'event permit', 'apply for', 'application for',
      'zoning approval', 'variance', 'conditional use',
    ],
    shouldCreateRecord: true,
  },
  {
    classification: 'resident_complaint',
    keywords: [
      'pothole', 'road repair', 'streetlight', 'street light', 'noise complaint',
      'noise issue', 'barking dog', 'trash', 'garbage', 'flooding', 'water main',
      'broken sidewalk', 'fallen tree', 'power outage', 'i want to report',
      'i am writing to complain', 'i would like to complain', 'complaint',
      'concerned about', 'problem with', 'issue on', 'not working',
    ],
    shouldCreateRecord: true,
  },
  {
    classification: 'meeting_related',
    keywords: [
      'town meeting', 'council meeting', 'public meeting', 'meeting agenda',
      'meeting minutes', 'public hearing', 'public comment', 'attend the meeting',
      'upcoming meeting', 'next meeting', 'board meeting', 'zoning hearing',
      'planning meeting', 'agenda item',
    ],
    shouldCreateRecord: false,
  },
  {
    classification: 'board_related',
    keywords: [
      'planning commission', 'zoning board', 'board of appeals', 'conservation commission',
      'interested in serving', 'board vacancy', 'board position', 'committee member',
      'appointed to', 'reappoint', 'term expiring', 'volunteer for the board',
    ],
    shouldCreateRecord: false,
  },
  {
    classification: 'spam_or_vendor',
    keywords: [
      'unsubscribe', 'click here', 'special offer', 'limited time', 'you have been selected',
      'congratulations you', 'free trial', 'demo request', 'sales inquiry',
      'marketing', 'newsletter', 'sponsored', 'advertisement', 'promotional',
      'no-reply', 'noreply', 'donotreply', 'do-not-reply',
    ],
    shouldCreateRecord: false,
  },
]

const SHOULD_CREATE_RECORD: EmailClassification[] = [
  'records_request',
  'permit_application',
  'resident_complaint',
]

export async function classifyEmail(email: {
  fromEmail: string
  fromName: string
  subject: string
  bodyText: string
}): Promise<ClassificationResult> {
  const subject = email.subject.toLowerCase()
  const body = email.bodyText.toLowerCase().slice(0, 3000)

  const scores: Record<EmailClassification, number> = {
    records_request: 0,
    permit_application: 0,
    resident_complaint: 0,
    meeting_related: 0,
    board_related: 0,
    general_inquiry: 0,
    spam_or_vendor: 0,
  }

  for (const rule of RULES) {
    for (const keyword of rule.keywords) {
      // Subject matches count double
      if (subject.includes(keyword)) scores[rule.classification] += 2
      if (body.includes(keyword)) scores[rule.classification] += 1
    }
  }

  // Find the highest scoring category
  let best: EmailClassification = 'general_inquiry'
  let bestScore = 0
  for (const [cls, score] of Object.entries(scores)) {
    if (score > bestScore) {
      bestScore = score
      best = cls as EmailClassification
    }
  }

  const confidence: Confidence =
    bestScore >= 4 ? 'high' : bestScore >= 2 ? 'medium' : bestScore === 1 ? 'low' : 'low'

  const summary = buildSummary(best, email.subject, email.fromName)

  return {
    classification: best,
    confidence: bestScore === 0 ? 'low' : confidence,
    summary,
    shouldCreateRecord: SHOULD_CREATE_RECORD.includes(best),
  }
}

function buildSummary(
  classification: EmailClassification,
  subject: string,
  fromName: string,
): string {
  const name = fromName || 'Someone'
  switch (classification) {
    case 'records_request':
      return `${name} submitted a public records request: "${subject}"`
    case 'permit_application':
      return `${name} is inquiring about or applying for a permit: "${subject}"`
    case 'resident_complaint':
      return `${name} reported an issue: "${subject}"`
    case 'meeting_related':
      return `Email about a town meeting: "${subject}"`
    case 'board_related':
      return `Email about a town board or commission: "${subject}"`
    case 'spam_or_vendor':
      return `Likely spam or vendor email: "${subject}"`
    default:
      return `General inquiry: "${subject}"`
  }
}
