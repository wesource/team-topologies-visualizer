#!/usr/bin/env python3
"""Migration script: Add team_id field to all team markdown files

This script:
1. Scans all team markdown files in data/tt-teams, data/tt-teams-initial, and data/current-teams
2. For each file:
   - Derives team_id from filename (e.g., "api-gateway-team.md" -> "api-gateway-team")
   - Adds team_id field to YAML front matter (after name field)
   - Preserves all other content and formatting
3. Supports dry-run mode to preview changes without modifying files

Usage:
    python scripts/migrate_add_team_ids.py          # Dry-run (preview only)
    python scripts/migrate_add_team_ids.py --apply  # Apply changes
"""
import argparse
import re
from pathlib import Path


def derive_team_id_from_filename(filename: str) -> str:
    """Derive team_id from filename
    
    Examples:
        "api-gateway-team.md" -> "api-gateway-team"
        "CI-CD Team.md" -> "ci-cd-team"
    """
    # Remove .md extension
    team_id = filename.replace('.md', '')
    # Convert to lowercase and normalize
    team_id = team_id.lower()
    # Replace spaces with dashes
    team_id = team_id.replace(' ', '-')
    # Remove any remaining special characters except dashes
    team_id = re.sub(r'[^a-z0-9-]', '', team_id)
    # Replace multiple dashes with single dash
    team_id = re.sub(r'-+', '-', team_id)
    # Remove leading/trailing dashes
    team_id = team_id.strip('-')
    return team_id


def add_team_id_to_file(file_path: Path, dry_run: bool = True) -> tuple[bool, str]:
    """Add team_id field to a team file's YAML front matter
    
    Returns:
        (modified, message): Whether file was/would be modified and a status message
    """
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()
    
    if not content.startswith('---'):
        return False, f"SKIP: {file_path.name} - No YAML front matter found"
    
    # Check if team_id already exists
    if re.search(r'^team_id:', content, re.MULTILINE):
        return False, f"SKIP: {file_path.name} - team_id already exists"
    
    # Derive team_id from filename
    team_id = derive_team_id_from_filename(file_path.name)
    
    # Split content into parts
    parts = content.split('---', 2)
    if len(parts) < 3:
        return False, f"SKIP: {file_path.name} - Invalid YAML front matter structure"
    
    yaml_content = parts[1]
    markdown_content = parts[2]
    
    # Find the 'name:' field and add team_id right after it
    # This ensures team_id appears near the top of YAML
    name_match = re.search(r'^(name:.*?)$', yaml_content, re.MULTILINE)
    if not name_match:
        return False, f"SKIP: {file_path.name} - No 'name' field found in YAML"
    
    name_line_end = name_match.end()
    
    # Insert team_id field after name
    new_yaml = (
        yaml_content[:name_line_end] + 
        f"\nteam_id: {team_id}" + 
        yaml_content[name_line_end:]
    )
    
    new_content = f"---{new_yaml}---{markdown_content}"
    
    if not dry_run:
        with open(file_path, 'w', encoding='utf-8') as f:
            f.write(new_content)
        return True, f"MODIFIED: {file_path.name} - Added team_id: {team_id}"
    else:
        return True, f"WOULD MODIFY: {file_path.name} - Would add team_id: {team_id}"


def main():
    parser = argparse.ArgumentParser(
        description="Add team_id field to all team markdown files",
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog=__doc__
    )
    parser.add_argument(
        '--apply',
        action='store_true',
        help='Apply changes (default is dry-run/preview mode)'
    )
    
    args = parser.parse_args()
    
    # Directories to process
    data_dirs = [
        Path('data/tt-teams'),
        Path('data/tt-teams-initial'),
        Path('data/current-teams')
    ]
    
    print("=" * 80)
    if args.apply:
        print("🔧 APPLYING MIGRATION: Adding team_id to all team files")
    else:
        print("👁️  DRY RUN: Preview changes (use --apply to actually modify files)")
    print("=" * 80)
    print()
    
    total_files = 0
    modified_count = 0
    skipped_count = 0
    
    for data_dir in data_dirs:
        if not data_dir.exists():
            print(f"⚠️  Directory not found: {data_dir}")
            continue
        
        print(f"\n📁 Processing: {data_dir}/")
        print("-" * 80)
        
        md_files = sorted(data_dir.glob('*.md'))
        for file_path in md_files:
            total_files += 1
            modified, message = add_team_id_to_file(file_path, dry_run=not args.apply)
            
            if modified:
                modified_count += 1
                print(f"  ✓ {message}")
            else:
                skipped_count += 1
                print(f"  → {message}")
    
    print()
    print("=" * 80)
    print(f"📊 Summary:")
    print(f"   Total files scanned: {total_files}")
    print(f"   Files modified/would modify: {modified_count}")
    print(f"   Files skipped: {skipped_count}")
    print("=" * 80)
    
    if not args.apply and modified_count > 0:
        print()
        print("💡 To apply these changes, run:")
        print("   python scripts/migrate_add_team_ids.py --apply")


if __name__ == '__main__':
    main()
