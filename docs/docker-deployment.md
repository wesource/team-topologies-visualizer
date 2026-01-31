# Docker Deployment Guide

This guide covers Docker and Podman deployment details, including volume mounting, environment variables, and production usage patterns.

For basic setup instructions, see [setup.md](setup.md).

## Volume Mounting

Volume mounting allows you to:
- Edit team markdown files on your host machine
- Persist data across container restarts
- Use Git for version control of team files
- Enable non-developers to edit files via GitHub/GitLab web interface

### Basic Volume Mount

```bash
docker run -p 8000:8000 -v ./data:/app/data team-topologies-viz
```

**What this does:**
- `-v ./data:/app/data` mounts your local `data/` directory into the container at `/app/data`
- The container reads team files from your host filesystem
- Changes to files on your host are immediately visible in the running application
- Data persists when you stop/restart the container

### Platform-Specific Volume Mounting

#### Linux/Mac (Docker)

```bash
docker run -p 8000:8000 -v ./data:/app/data team-topologies-viz
```

Use relative path `./data` or absolute path `/full/path/to/data`.

#### Linux/Mac (Podman with SELinux)

```bash
podman run -p 8000:8000 -v ./data:/app/data:z team-topologies-viz
```

**SELinux systems**: Add `:z` flag to relabel the volume for container access. Without this, the container may not have permission to read/write files.

#### Windows (PowerShell)

```powershell
# Use ${PWD} for current directory
podman run -p 8000:8000 -v ${PWD}/data:/app/data team-topologies-viz

# Or use full path
docker run -p 8000:8000 -v C:/Users/username/project/data:/app/data team-topologies-viz
```

**Important:**
- Use PowerShell, not Git Bash (Git Bash has path conversion issues)
- Use forward slashes `/` in paths, even on Windows
- Use `${PWD}` instead of `./` in PowerShell
- Omit `:z` flag on Windows (SELinux not used)

#### Windows (Git Bash - Not Recommended)

Git Bash may incorrectly convert paths. If you must use Git Bash:

```bash
docker run -p 8000:8000 -v /${PWD}/data:/app/data team-topologies-viz
```

But PowerShell is the recommended approach on Windows.

## Environment Variables

### READ_ONLY_MODE

Enable read-only mode for demonstrations, workshops, or public-facing deployments where you don't want users to save changes.

```bash
docker run -p 8000:8000 -e READ_ONLY_MODE=true team-topologies-viz
```

**What it does:**
- Displays a banner indicating read-only mode
- Blocks all write operations:
  - Team position updates (drag-and-drop)
  - Snapshot creation
- Allows full visualization interaction (zoom, pan, view switching)

**Use cases:**
- Public demonstrations
- Training workshops
- Exploratory sessions where changes shouldn't persist

### TT_DESIGN_VARIANT

Switch between multiple TT design variants (different design proposals or evolution stages).

```bash
docker run -p 8000:8000 -e TT_DESIGN_VARIANT=tt-teams-initial team-topologies-viz
```

**What it does:**
- Changes which `data/` subfolder the app reads TT design teams from
- Default: `tt-teams` (if `TT_DESIGN_VARIANT` is not set)
- Custom: any folder name you specify (e.g., `tt-teams-initial`, `tt-design-2024-q1`)

**Use cases:**
- Comparing different design proposals side-by-side
- Tracking transformation evolution over time
- A/B testing different TT designs

**Example variants:**
```bash
# First-step transformation
docker run -p 8000:8000 -e TT_DESIGN_VARIANT=tt-teams-initial team-topologies-viz

# Mid-stage transformation (default)
docker run -p 8000:8000 team-topologies-viz

# Future proposal
docker run -p 8000:8000 -e TT_DESIGN_VARIANT=tt-design-2024-q2 team-topologies-viz
```

### Combining Environment Variables

```bash
docker run -p 8000:8000 \
  -e READ_ONLY_MODE=true \
  -e TT_DESIGN_VARIANT=tt-teams-initial \
  -v ./data:/app/data \
  team-topologies-viz
```

## Container Management

### Start Container

```bash
docker run -p 8000:8000 -v ./data:/app/data team-topologies-viz
```

**Run in background (detached):**
```bash
docker run -d -p 8000:8000 -v ./data:/app/data team-topologies-viz
```

### Stop Container

```bash
# List running containers
docker ps

# Stop by container ID
docker stop <container-id>

# Stop all running containers
docker stop $(docker ps -q)
```

### View Logs

```bash
# Follow logs in real-time
docker logs -f <container-id>

# Last 100 lines
docker logs --tail 100 <container-id>
```

### Remove Container

```bash
# Remove stopped container
docker rm <container-id>

# Remove all stopped containers
docker container prune
```

### Restart Container

```bash
docker restart <container-id>
```

## Company/Team Deployment Workflow

### Typical Company Setup

1. **Fork or clone the repository**
   ```bash
   git clone https://github.com/your-org/team-topologies-visualizer.git
   cd team-topologies-visualizer
   ```

2. **Customize for your organization**
   - Edit `data/baseline-teams/baseline-team-types.json` with your team classifications
   - Replace example team files in `data/baseline-teams/` with your actual teams
   - Design your TT future state in `data/tt-teams/`

3. **Commit and push to your fork**
   ```bash
   git add data/
   git commit -m "Add our organization's team data"
   git push origin main
   ```

4. **Deploy with Docker + volume mount**
   ```bash
   docker build -t team-topologies-viz .
   docker run -d -p 8000:8000 -v ./data:/app/data team-topologies-viz
   ```

5. **Team members edit files**
   - **Option A**: Edit locally and push to Git
   - **Option B**: Edit directly in GitHub/GitLab web interface (no local setup needed)

6. **Pull updates and restart**
   ```bash
   git pull origin main
   docker restart <container-id>
   ```

### GitHub/GitLab Web Editing Workflow

**Best for non-developers:**

1. Navigate to `data/baseline-teams/` or `data/tt-teams/` in GitHub/GitLab
2. Click on a team file (e.g., `mobile-app-team.md`)
3. Click "Edit" button (pencil icon)
4. Edit YAML front matter or Markdown content
5. Commit changes directly in the web interface
6. Changes are immediately in Git (version controlled, auditable)
7. Pull changes on the server and restart container

**Advantages:**
- No local setup required
- Git version control automatically
- Accessible to non-technical team members
- Audit trail of who changed what

### Multi-Environment Setup

**Development:**
```bash
docker run -p 8000:8000 -v ./data-dev:/app/data team-topologies-viz
```

**Staging:**
```bash
docker run -p 8000:8000 -v ./data-staging:/app/data team-topologies-viz
```

**Production (read-only):**
```bash
docker run -p 8000:8000 \
  -e READ_ONLY_MODE=true \
  -v ./data:/app/data \
  team-topologies-viz
```

## Troubleshooting

### Permission Denied Errors

**Problem:** Container can't read/write files in mounted volume.

**Solution (Linux/Mac with SELinux):**
```bash
# Add :z flag for SELinux relabeling
podman run -p 8000:8000 -v ./data:/app/data:z team-topologies-viz
```

**Solution (Windows):**
```powershell
# Ensure Docker Desktop has access to the drive
# Settings → Resources → File Sharing → Add drive
```

### Path Conversion Issues (Windows Git Bash)

**Problem:** Volume mount doesn't work in Git Bash.

**Solution:** Use PowerShell instead:
```powershell
podman run -p 8000:8000 -v ${PWD}/data:/app/data team-topologies-viz
```

### Container Exits Immediately

**Problem:** Container starts but exits right away.

**Check logs:**
```bash
docker logs <container-id>
```

**Common causes:**
- Port 8000 already in use
- Missing dependencies in Dockerfile
- Syntax error in Python code

### Changes Not Visible

**Problem:** Edited team files but changes don't appear in the app.

**Solution 1:** Hard refresh browser
```
Ctrl+Shift+R (Windows/Linux)
Cmd+Shift+R (Mac)
```

**Solution 2:** Check volume mount is correct
```bash
# Verify mount point
docker inspect <container-id> | grep Mounts -A 10
```

**Solution 3:** Restart container
```bash
docker restart <container-id>
```

### Port Already in Use

**Problem:** `docker run` fails with "port is already allocated".

**Solution:** Find and stop process using port 8000
```bash
# Linux/Mac
lsof -i :8000
kill <PID>

# Windows PowerShell
netstat -ano | findstr :8000
taskkill /PID <PID> /F
```

Or use a different port:
```bash
docker run -p 8080:8000 -v ./data:/app/data team-topologies-viz
```

## Production Considerations

### Resource Limits

Limit container resources:
```bash
docker run -p 8000:8000 \
  --memory="512m" \
  --cpus="1.0" \
  -v ./data:/app/data \
  team-topologies-viz
```

### Health Checks

Add health check to Dockerfile:
```dockerfile
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:8000/docs || exit 1
```

### Reverse Proxy

Run behind nginx or traefik for HTTPS:
```nginx
server {
    listen 443 ssl;
    server_name tt-viz.example.com;

    location / {
        proxy_pass http://localhost:8000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

### Backup Strategy

```bash
# Backup data folder
tar -czf data-backup-$(date +%Y%m%d).tar.gz data/

# Or rely on Git (recommended)
cd data/
git add .
git commit -m "Backup: $(date +%Y-%m-%d)"
git push
```

## Docker Compose (Optional)

For more complex setups, use Docker Compose:

```yaml
# docker-compose.yml
version: '3.8'

services:
  app:
    build: .
    ports:
      - "8000:8000"
    volumes:
      - ./data:/app/data
    environment:
      - READ_ONLY_MODE=false
      - TT_DESIGN_VARIANT=tt-teams
    restart: unless-stopped
```

**Usage:**
```bash
# Start
docker-compose up -d

# Stop
docker-compose down

# View logs
docker-compose logs -f

# Rebuild
docker-compose up -d --build
```

## Next Steps

- See [setup.md](setup.md) for local Python setup
- See [usage.md](usage.md) for UI walkthrough
- See [example_data.md](example_data.md) for example data variants
