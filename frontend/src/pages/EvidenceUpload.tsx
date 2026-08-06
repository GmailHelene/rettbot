import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Upload, AlertCircle, FileText, Check, X } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

interface UploadedFile {
  name: string;
  size: number;
  type: string;
  uploadedAt: string;
}

export default function EvidenceUpload() {
  const { token } = useAuth();
  const [files, setFiles] = useState<File[]>([]);
  const [caseId, setCaseId] = useState('');
  const [cases, setCases] = useState<{ case_number: string; title: string }[]>([]);
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    if (!token) return;
    fetch('/api/cases', { headers: { Authorization: `Bearer ${token}` } })
      .then((r) => (r.ok ? r.json() : { cases: [] }))
      .then((d) => setCases((d.cases || []).map((c: any) => ({ case_number: c.case_number, title: c.title }))))
      .catch(() => {});
  }, [token]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFiles(Array.from(e.target.files));
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (e.dataTransfer.files) {
      setFiles(Array.from(e.dataTransfer.files));
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
  };

  const removeFile = (index: number) => {
    setFiles(files.filter((_, i) => i !== index));
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(2) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
  };

  const handleUpload = async () => {
    if (files.length === 0) {
      setError('Vennligst velg minst én fil');
      return;
    }

    if (!token) {
      setError('Du må være innlogget for å laste opp bevis.');
      return;
    }

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const newUploads: UploadedFile[] = [];

      for (const file of files) {
        const formData = new FormData();
        formData.append('file', file);
        if (description) formData.append('description', description);
        if (caseId) formData.append('case_ref', caseId);

        const response = await fetch('/api/evidence/upload', {
          method: 'POST',
          headers: { Authorization: `Bearer ${token}` },
          body: formData,
        });

        if (!response.ok) {
          const errData = await response.json().catch(() => ({}));
          throw new Error(errData.detail || errData.error || `Opplasting av ${file.name} feilet`);
        }

        newUploads.push({
          name: file.name,
          size: file.size,
          type: file.type,
          uploadedAt: new Date().toISOString(),
        });
      }

      setUploadedFiles([...uploadedFiles, ...newUploads]);
      setFiles([]);
      setSuccess(`${newUploads.length} fil(er) lastet opp og kryptert`);
    } catch (err: any) {
      setError(err.message || 'Kunne ikke laste opp filer. Prøv igjen.');
      console.error('Error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 shadow-sm">
        <div className="max-w-5xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
          <div className="flex items-center">
            <Link
              to="/"
              className="mr-4 p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
            >
              <ArrowLeft className="header-icon" />
            </Link>
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center">
                <Upload className="header-title-icon mr-3 text-blue-600" />
                Last opp bevis
              </h1>
              <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                Sikker opplasting og kryptering av dokumenter
              </p>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-5xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        <div className="space-y-6">
          {/* Case ID */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
              Saksinformasjon (valgfritt)
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Knytt til sak
                </label>
                <select
                  value={caseId}
                  onChange={(e) => setCaseId(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                >
                  <option value="">Ingen sak</option>
                  {cases.map((c) => (
                    <option key={c.case_number} value={c.case_number}>
                      {c.title} ({c.case_number})
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Beskrivelse
                </label>
                <input
                  type="text"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="F.eks: DNA-bevis"
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>
            </div>
          </div>

          {/* Upload Area */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
              Last opp filer
            </h2>
            
            <div
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-8 text-center hover:border-blue-500 transition-colors cursor-pointer"
            >
              <Upload className="w-12 h-12 mx-auto mb-4 text-gray-400" />
              <p className="text-gray-700 dark:text-gray-300 mb-2">
                Dra og slipp filer her, eller
              </p>
              <label className="inline-block px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg cursor-pointer transition-colors">
                Velg filer
                <input
                  type="file"
                  multiple
                  onChange={handleFileChange}
                  className="hidden"
                  accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.txt,.xls,.xlsx"
                />
              </label>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                Støttede formater: PDF, Word, Excel, Bilder, Tekst
              </p>
            </div>

            {/* Selected Files */}
            {files.length > 0 && (
              <div className="mt-6">
                <h3 className="font-semibold text-gray-900 dark:text-white mb-3">
                  Valgte filer ({files.length})
                </h3>
                <div className="space-y-2">
                  {files.map((file, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between bg-gray-50 dark:bg-gray-700 p-3 rounded-lg"
                    >
                      <div className="flex items-center flex-1">
                        <FileText className="w-5 h-5 text-blue-600 mr-3" />
                        <div className="flex-1">
                          <div className="text-sm font-medium text-gray-900 dark:text-white">
                            {file.name}
                          </div>
                          <div className="text-xs text-gray-500 dark:text-gray-400">
                            {formatFileSize(file.size)}
                          </div>
                        </div>
                      </div>
                      <button
                        onClick={() => removeFile(index)}
                        className="ml-4 p-1 hover:bg-red-100 dark:hover:bg-red-900/20 rounded transition-colors"
                      >
                        <X className="w-5 h-5 text-red-600" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {error && (
              <div className="mt-4 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg flex items-start">
                <AlertCircle className="w-5 h-5 text-red-600 mr-2 flex-shrink-0 mt-0.5" />
                <span className="text-red-700 dark:text-red-400">{error}</span>
              </div>
            )}

            {success && (
              <div className="mt-4 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg flex items-start">
                <Check className="w-5 h-5 text-green-600 mr-2 flex-shrink-0 mt-0.5" />
                <span className="text-green-700 dark:text-green-400">{success}</span>
              </div>
            )}

            <button
              onClick={handleUpload}
              disabled={loading || files.length === 0}
              className="mt-6 w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-semibold py-3 px-6 rounded-lg transition-colors flex items-center justify-center"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2" />
                  Laster opp og krypterer...
                </>
              ) : (
                <>
                  <Upload className="w-5 h-5 mr-2" />
                  Last opp {files.length} fil{files.length !== 1 ? 'er' : ''}
                </>
              )}
            </button>
          </div>

          {/* Uploaded Files */}
          {uploadedFiles.length > 0 && (
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                Opplastede filer ({uploadedFiles.length})
              </h2>
              <div className="space-y-2">
                {uploadedFiles.map((file, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between bg-green-50 dark:bg-green-900/20 p-3 rounded-lg"
                  >
                    <div className="flex items-center flex-1">
                      <Check className="w-5 h-5 text-green-600 mr-3" />
                      <div className="flex-1">
                        <div className="text-sm font-medium text-gray-900 dark:text-white">
                          {file.name}
                        </div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">
                          {formatFileSize(file.size)} • Kryptert • {new Date(file.uploadedAt).toLocaleString('nb-NO')}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Security Info */}
          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-6">
            <h3 className="font-semibold text-blue-900 dark:text-blue-400 mb-2 flex items-center">
              🔒 Sikkerhetsinformasjon
            </h3>
            <ul className="text-sm text-blue-800 dark:text-blue-300 space-y-1">
              <li>• Filer krypteres server-side (Fernet / AES) før de lagres i databasen</li>
              <li>• Overføres kryptert via HTTPS</li>
              <li>• Kun du (innlogget) har tilgang til dine egne filer</li>
              <li>• Merk: serveren har krypteringsnøkkelen – dette er ikke zero-knowledge</li>
            </ul>
          </div>
        </div>
      </main>
    </div>
  );
}
