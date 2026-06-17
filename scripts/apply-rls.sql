-- Row Level Security policies for ClerkFlow tenant isolation.
-- Safe to re-run: drops policies before recreating them.
-- Does NOT apply to: users, towns, prospects (admin-only / auth bootstrap tables).

-- ── foia_requests ──────────────────────────────────────────────────────────
ALTER TABLE foia_requests ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS foia_requests_town_isolation ON foia_requests;
CREATE POLICY foia_requests_town_isolation ON foia_requests
  USING  (town_id::text = current_setting('app.current_town_id', true))
  WITH CHECK (town_id::text = current_setting('app.current_town_id', true));

-- ── meetings ───────────────────────────────────────────────────────────────
ALTER TABLE meetings ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS meetings_town_isolation ON meetings;
CREATE POLICY meetings_town_isolation ON meetings
  USING  (town_id::text = current_setting('app.current_town_id', true))
  WITH CHECK (town_id::text = current_setting('app.current_town_id', true));

-- ── board_terms ────────────────────────────────────────────────────────────
ALTER TABLE board_terms ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS board_terms_town_isolation ON board_terms;
CREATE POLICY board_terms_town_isolation ON board_terms
  USING  (town_id::text = current_setting('app.current_town_id', true))
  WITH CHECK (town_id::text = current_setting('app.current_town_id', true));

-- ── foia_messages (no direct town_id — join via foia_requests) ─────────────
ALTER TABLE foia_messages ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS foia_messages_town_isolation ON foia_messages;
CREATE POLICY foia_messages_town_isolation ON foia_messages
  USING (
    foia_request_id IN (
      SELECT id FROM foia_requests
      WHERE town_id::text = current_setting('app.current_town_id', true)
    )
  )
  WITH CHECK (
    foia_request_id IN (
      SELECT id FROM foia_requests
      WHERE town_id::text = current_setting('app.current_town_id', true)
    )
  );

-- ── foia_workflow_steps (no direct town_id — join via foia_requests) ────────
ALTER TABLE foia_workflow_steps ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS foia_workflow_steps_town_isolation ON foia_workflow_steps;
CREATE POLICY foia_workflow_steps_town_isolation ON foia_workflow_steps
  USING (
    foia_request_id IN (
      SELECT id FROM foia_requests
      WHERE town_id::text = current_setting('app.current_town_id', true)
    )
  )
  WITH CHECK (
    foia_request_id IN (
      SELECT id FROM foia_requests
      WHERE town_id::text = current_setting('app.current_town_id', true)
    )
  );

-- ── agenda_items (no direct town_id — join via meetings) ───────────────────
ALTER TABLE agenda_items ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS agenda_items_town_isolation ON agenda_items;
CREATE POLICY agenda_items_town_isolation ON agenda_items
  USING (
    meeting_id IN (
      SELECT id FROM meetings
      WHERE town_id::text = current_setting('app.current_town_id', true)
    )
  )
  WITH CHECK (
    meeting_id IN (
      SELECT id FROM meetings
      WHERE town_id::text = current_setting('app.current_town_id', true)
    )
  );
