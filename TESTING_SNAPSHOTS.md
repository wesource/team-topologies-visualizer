# Testing the Snapshot Feature - Quick Start Guide

## Start the Server

```powershell
# From project root
.\venv\Scripts\python.exe -m uvicorn main:app --reload
```

Then open: http://localhost:8000/static/index.html

## Test Workflow (5 minutes)

### 1. Create Your First Snapshot

1. Make sure you're in **TT Design** view (not Pre-TT)
2. Look for the new **"📸 Create Snapshot"** button in the toolbar
3. Click it to open the modal
4. You'll see a preview: "This will capture 34 teams across X value streams and Y platform groupings"
5. The name field has an auto-suggestion: "TT Design v1.0 - 2026-01-05"
6. Add a description (optional): "Initial snapshot to test the feature"
7. Add your name (optional): "Your Name"
8. Click **"Create Snapshot"**
9. You should see a success notification

### 2. Make Some Changes

1. Drag a few teams to new positions
2. This simulates making changes to your TT Design

### 3. Create Another Snapshot

1. Click **"📸 Create Snapshot"** again
2. Change the name to: "TT Design v1.1 - 2026-01-05"
3. Description: "After moving some teams"
4. Click **"Create Snapshot"**

### 4. View Snapshot History

1. Click the **"🕐 Timeline"** button in the toolbar
2. A side panel slides in from the right
3. You should see:
   - **▶ Current (Live)** - The editable current state (highlighted)
   - **📸 TT Design v1.1** - Your second snapshot
   - **📸 TT Design v1.0** - Your first snapshot

### 5. Load a Historical Snapshot

1. Click on **"📸 TT Design v1.0"** in the timeline
2. Watch the canvas reload with the old positions
3. A purple banner appears at the top: **"📸 Viewing Snapshot: TT Design v1.0 (date/time)"**
4. Try to drag a team - **it won't move** (read-only mode ✓)
5. You can still:
   - Pan (right-click drag)
   - Zoom (Ctrl+/- or mouse wheel)
   - Click teams to view details

### 6. Switch Between Snapshots

1. Keep the timeline panel open
2. Click **"📸 TT Design v1.1"** - see the updated positions
3. Click **"▶ Current (Live)"** - return to editable mode
4. Or click **"Return to Live View"** button in the purple banner

### 7. Verify Read-Only Mode

When viewing a snapshot:
- ✅ Banner shows at top
- ✅ "📸 Create Snapshot" button disappears (prevents confusion)
- ✅ Cannot drag teams
- ✅ Can still pan/zoom
- ✅ Timeline button still visible

## What to Look For

### Success Indicators
- ✅ Snapshots create without errors
- ✅ Timeline lists all snapshots
- ✅ Clicking snapshots loads frozen views
- ✅ Banner shows snapshot name and date
- ✅ Teams are at their historical positions
- ✅ Drag-and-drop disabled when viewing snapshot
- ✅ Return to Live View works
- ✅ Timeline highlights active snapshot

### Files Created
Check `data/tt-snapshots/` directory:
```
data/tt-snapshots/
├── tt-design-v10-20260105-103045.json
└── tt-design-v11-20260105-104523.json
```

Each file should be ~30-60 KB (depending on team count).

## Advanced Testing

### Test Error Handling
1. Create a snapshot with a very long description (500+ characters) - should work fine
2. Create a snapshot with special characters in the name - should work
3. Try creating snapshots rapidly (3-4 in a row) - should all work

### Test Data Integrity
1. Create a snapshot
2. Open `data/tt-snapshots/[snapshot-id].json` in a text editor
3. Verify it contains:
   - `snapshot_id`
   - `name`, `description`, `author`, `created_at`
   - `teams` array with all your teams
   - `statistics` object with counts

### Test Git Workflow
```powershell
# Check git status
git status

# You should see:
# modified:   backend/models.py
# modified:   backend/routes.py
# new file:   backend/snapshot_services.py
# new file:   frontend/snapshot-handlers.js
# new file:   data/tt-snapshots/tt-design-v10-*.json
# ... etc

# Snapshots are tracked by default (not gitignored)
# If you want to ignore them:
# Uncomment the line in .gitignore:
# data/tt-snapshots/*.json
```

## Common Issues

### "📸 Create Snapshot" button not visible
- Make sure you're in **TT Design** view (not Pre-TT)
- If viewing a snapshot, return to Live View first

### Timeline is empty
- Make sure you've created at least one snapshot
- Check `data/snapshots/` directory exists and has JSON files

### Snapshot won't load
- Check browser console for errors (F12)
- Verify the snapshot JSON file exists in `data/snapshots/`
- Check file permissions

### Teams not showing correct positions in snapshot
- This is expected! Snapshots freeze positions at the time of creation
- If you drag teams after creating a snapshot, those changes won't affect historical snapshots
- Create a new snapshot to capture current positions

## Performance Baseline

With 34 teams (current repo):
- ⏱️ Snapshot creation: ~0.5 seconds
- ⏱️ List snapshots: <0.1 seconds
- ⏱️ Load snapshot: ~0.2 seconds
- 💾 Snapshot file size: ~50 KB

With 100+ teams:
- File sizes will be 100-200 KB
- May need pagination in timeline

## Next Steps After Testing

1. **Review design questions** in `SNAPSHOT_IMPLEMENTATION.md`
2. **Provide feedback** on any UI/UX improvements
3. **Decide on git workflow** (track snapshots or gitignore them)
4. **Test with your actual team** to get real-world feedback
5. **Create quarterly snapshots** going forward

## Troubleshooting Commands

```powershell
# Check backend logs
# Look for snapshot-related output when creating/loading

# List snapshot files
Get-ChildItem data/tt-snapshots/*.json

# View snapshot content
Get-Content data/tt-snapshots/tt-design-v10-*.json | ConvertFrom-Json | ConvertTo-Json -Depth 10

# Delete test snapshots
Remove-Item data/tt-snapshots/test-*.json

# Run backend tests
.\venv\Scripts\python.exe -m pytest tests_backend/test_snapshots.py -v
```

## Feature Comparison

| Feature | Before | After |
|---------|--------|-------|
| Track evolution | ❌ Only via git commits | ✅ Visual snapshots with timeline |
| Compare changes | ❌ Difficult | ✅ Click between snapshots |
| Read-only history | ❌ None | ✅ Immutable snapshots |
| Stakeholder demos | ❌ Manual screenshots | ✅ Named snapshots with descriptions |
| Experimentation | ❌ Risk breaking current state | ✅ Snapshot before changes |
| Audit trail | ⚠️ Git logs only | ✅ Structured JSON + git |

Enjoy the new snapshot feature! 🎉
