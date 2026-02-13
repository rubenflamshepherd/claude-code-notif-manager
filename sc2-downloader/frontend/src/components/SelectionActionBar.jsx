import { useState, useEffect } from 'react';
import { Button } from '../catalyst/button';
import { Listbox, ListboxLabel, ListboxOption } from '../catalyst/listbox';
import { useSelection } from '../contexts/SelectionContext';
import { useNotifications } from '../contexts/NotificationContext';

const SOUND_FOLDERS = [
  { value: 'done', label: 'done', description: 'When Claude finishes' },
  { value: 'start', label: 'start', description: 'Session start' },
  { value: 'userpromptsubmit', label: 'userpromptsubmit', description: 'Prompt submitted' },
  { value: 'precompact', label: 'precompact', description: 'Before compaction' },
];

function extractFilename(audioUrl) {
  const urlParts = audioUrl.split('/');
  return urlParts.find((part) => part.endsWith('.ogg')) || 'audio.ogg';
}

function sanitizeFilename(name) {
  return name.replace(/[<>:"/\\|?*]/g, '_');
}

function createQuoteSuffix(text, maxLength = 50) {
  if (!text) return '';
  const sanitized = text
    .replace(/[<>:"/\\|?*]/g, '')
    .replace(/['\u2018\u2019]/g, '')
    .replace(/[.,!;:]+$/g, '')
    .trim();

  if (sanitized.length <= maxLength) return sanitized;
  const truncated = sanitized.slice(0, maxLength);
  const lastSpace = truncated.lastIndexOf(' ');
  return lastSpace > maxLength * 0.6 ? truncated.slice(0, lastSpace) : truncated;
}

export default function SelectionActionBar() {
  const { selectedCount, selectedArray, clearSelection } = useSelection();
  const { pushNotification } = useNotifications();

  const [isDownloading, setIsDownloading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [selectedFolder, setSelectedFolder] = useState('done');
  const [saveResult, setSaveResult] = useState(null);

  useEffect(() => {
    if (!saveResult) return undefined;
    const timer = setTimeout(() => setSaveResult(null), 3000);
    return () => clearTimeout(timer);
  }, [saveResult]);

  if (selectedCount === 0) return null;

  const prepareQuotes = () => selectedArray.map((item) => {
    const baseName = extractFilename(item.quote.audioUrl).replace('.ogg', '');
    const quoteSuffix = createQuoteSuffix(item.quote.text);
    const filename = quoteSuffix ? `${baseName} - ${quoteSuffix}.mp3` : `${baseName}.mp3`;

    return {
      audioUrl: item.quote.audioUrl,
      filename,
      unitName: sanitizeFilename(item.unitName),
      categoryName: sanitizeFilename(item.categoryName),
    };
  });

  const handleSaveToSounds = async () => {
    setIsSaving(true);
    setSaveResult(null);

    try {
      const quotes = prepareQuotes();
      const response = await fetch('http://localhost:3001/api/save-to-sounds', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ quotes, folder: selectedFolder }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Save failed');
      }

      setSaveResult({ success: true, saved: result.saved, targetDir: result.targetDir });
      clearSelection();
      pushNotification(`Saved ${result.saved} file${result.saved === 1 ? '' : 's'} to ${selectedFolder}.`, 'success');
    } catch (error) {
      console.error('Save error:', error);
      setSaveResult({ success: false, error: error.message });
      pushNotification(`Save failed: ${error.message}`, 'error');
    } finally {
      setIsSaving(false);
    }
  };

  const handleBatchDownload = async () => {
    setIsDownloading(true);

    try {
      const quotes = prepareQuotes();
      const response = await fetch('http://localhost:3001/api/download-batch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ quotes }),
      });

      if (!response.ok) throw new Error('Batch download failed');

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const anchor = document.createElement('a');
      anchor.href = url;
      anchor.download = 'sc2-quotes.zip';
      document.body.appendChild(anchor);
      anchor.click();
      document.body.removeChild(anchor);
      window.URL.revokeObjectURL(url);

      clearSelection();
      pushNotification('Batch ZIP downloaded.', 'success');
    } catch (error) {
      console.error('Batch download error:', error);
      pushNotification('Batch download failed. Make sure the backend server is running.', 'error');
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <div className="surface-panel fixed bottom-4 left-1/2 z-50 flex -translate-x-1/2 items-center gap-3 rounded-xl px-4 py-3 shadow-2xl">
      <span className="text-sm text-slate-300">{selectedCount} quote{selectedCount === 1 ? '' : 's'} selected</span>
      <Button plain onClick={clearSelection} className="!px-2 !py-1 !text-sm !text-slate-300">
        Clear
      </Button>

      <div className="ml-1 flex items-center gap-2 border-l border-white/15 pl-3">
        <Listbox
          value={selectedFolder}
          onChange={(value) => setSelectedFolder(value)}
          className="min-w-40"
        >
          {SOUND_FOLDERS.map((folder) => (
            <ListboxOption key={folder.value} value={folder.value}>
              <ListboxLabel>{folder.label}</ListboxLabel>
            </ListboxOption>
          ))}
        </Listbox>

        <Button
          color="green"
          onClick={handleSaveToSounds}
          disabled={isSaving}
          className="!px-3 !py-1.5 !text-sm"
          title={`Save to ~/.claude/sounds/${selectedFolder}/`}
        >
          {isSaving ? 'Saving...' : 'Save to Sounds'}
        </Button>
      </div>

      <Button
        color="sky"
        onClick={handleBatchDownload}
        disabled={isDownloading}
        className="!px-3 !py-1.5 !text-sm"
      >
        {isDownloading ? 'Downloading...' : 'Download ZIP'}
      </Button>

      {saveResult ? (
        <div className={`absolute -top-11 left-1/2 -translate-x-1/2 rounded px-3 py-1.5 text-xs ${saveResult.success ? 'bg-green-800 text-green-100' : 'bg-red-800 text-red-100'}`}>
          {saveResult.success ? `Saved ${saveResult.saved} file${saveResult.saved === 1 ? '' : 's'}` : `Error: ${saveResult.error}`}
        </div>
      ) : null}
    </div>
  );
}
