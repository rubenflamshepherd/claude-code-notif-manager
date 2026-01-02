# StarCraft Sounds for Claude Code

Play StarCraft II unit sounds during your Claude Code workflow. Hear Protoss units react when you submit prompts, when Claude finishes tasks, and more.

## How It Works

Claude Code [hooks](https://docs.anthropic.com/en/docs/claude-code/hooks) trigger shell commands at key moments in the workflow. This project uses hooks to create trigger files, which a background watcher detects and responds to by playing a random sound from the appropriate folder.

**Supported events:**
- `SessionStart` - Claude Code session begins
- `UserPromptSubmit` - You submit a prompt
- `Stop` - Claude finishes responding
- `PreCompact` - Context compaction is about to happen

## Prerequisites

```bash
brew install fswatch ffmpeg
```

## Quick Start

### 1. Start the app

```bash
cd sc2-downloader
npm run install:all
npm run dev
```

### 2. One-Click Setup

Open http://localhost:5173 and click **One-Click Setup**. This will:
- Configure Claude Code hooks in `~/.claude/settings.json`
- Download curated sounds to `~/.claude/sounds/`
- Install the sound listener script

### 3. Restart your terminal

The sound watcher will start automatically in new terminal sessions.

That's it! You should now hear StarCraft sounds during your Claude Code sessions.

## Usage

The watcher starts automatically when you open a new terminal. Use these commands to manage it:

```bash
claude_sound_watcher_status   # Check if running
claude_sound_watcher_stop     # Stop the watcher
claude_sound_watcher_start    # Start the watcher
claude_sound_watcher_restart  # Restart the watcher
```

## Customizing Sounds

The web app at http://localhost:5173 lets you:

- **Browse** - Explore Protoss, Terran, and Zerg unit quotes
- **Preview** - Listen before downloading
- **Customize** - Add/remove quotes from the recommended setup
- **Sync** - Click "Sync to .claude" to update your sounds folder

| Folder | Event |
|--------|-------|
| `start` | Session starts |
| `userpromptsubmit` | You submit a prompt |
| `done` | Claude finishes responding |
| `precompact` | Before context compaction |

## Configuration

Override defaults via environment variables in your `~/.zshrc`:

```bash
export CLAUDE_SOUNDS_DIR="$HOME/.claude/sounds"  # Sound files location
export CLAUDE_SOUND_VOLUME=50                     # Volume 0-100 (macOS only)
```

## Advanced Setup

If you prefer to configure things manually instead of using One-Click Setup:

### Configure Claude Code hooks

Add this to `~/.claude/settings.json`:

```json
{
  "hooks": {
    "SessionStart": [
      {
        "matcher": "startup|clear",
        "hooks": [{ "type": "command", "command": "touch ~/.claude/.claude-start" }]
      }
    ],
    "UserPromptSubmit": [
      {
        "hooks": [{ "type": "command", "command": "touch ~/.claude/.claude-prompt" }]
      }
    ],
    "Stop": [
      {
        "hooks": [{ "type": "command", "command": "touch ~/.claude/.claude-done" }]
      }
    ],
    "PreCompact": [
      {
        "hooks": [{ "type": "command", "command": "touch ~/.claude/.claude-compact" }]
      }
    ]
  }
}
```

### Enable the sound watcher

Copy the script and add to your `~/.zshrc`:

```bash
cp sc2-downloader/claude-sounds.zsh ~/.claude-sounds.zsh
echo 'source ~/.claude-sounds.zsh' >> ~/.zshrc
source ~/.zshrc
```

### Download sounds manually

Use the web app to browse and download individual sounds, or use "Download ZIP" from the settings menu to get all recommended sounds at once.

## Project Structure

```
starcraft-claude/
├── .claude-sounds.zsh   # Watcher script (source in .zshrc)
└── sc2-downloader/      # Web app to browse/download SC2 sounds
    ├── frontend/        # React + Vite UI
    ├── server/          # Express backend for MP3 conversion
    └── scripts/         # Wiki scraper
```
