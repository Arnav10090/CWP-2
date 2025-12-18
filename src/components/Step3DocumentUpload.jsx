import { useRef } from "react";
import {
  FileText,
  Loader,
  ChevronDown,
  Upload,
  CheckCircle,
  AlertCircle,
} from "lucide-react";

const documentOptions = [
  { id: "vehicleRegistration", label: "Vehicle Registration" },
  { id: "vehicleInsurance", label: "Vehicle Insurance" },
  { id: "vehiclePuc", label: "Vehicle PUC" },
  { id: "driverAadhar", label: "Driver Aadhar Card" },
  { id: "helperAadhar", label: "Helper Aadhar Card" },
  { id: "po", label: "Purchase Order (PO)" },
  { id: "do", label: "Delivery Order (DO)" },
  { id: "beforeWeighing", label: "Before Weighing Receipt" },
  { id: "afterWeighing", label: "After Weighing Receipt" },
];

const Step3DocumentUpload = (props) => {
  const {
    files,
    setFiles,
    selectedDocType,
    setSelectedDocType,
    stagedFile,
    setStagedFile,
    docDropdownOpen,
    setDocDropdownOpen,
    docSearch,
    setDocSearch,
    docHighlight,
    setDocHighlight,
    errors,
    setErrors,
    docButtonRef,
    docListRef,
    handleStageFile,
    handleUploadStaged,
    handleClearUploaded,
    loading,
    DocumentUploadField,
  } = props;

  return (
    <>
      <section className="rounded-2xl border border-gray-200 bg-gray-50 p-6">
        <div className="flex items-center gap-3">
          <FileText
            className="h-5 w-5 text-blue-600"
            aria-hidden="true"
          />
          <h2 className="text-lg font-semibold text-gray-800">
            Document Uploads
          </h2>
        </div>
        <div className="mt-6 grid gap-6">
          <div className="grid gap-3">
            <label
              htmlFor="docType"
              className="text-sm font-medium text-gray-700"
            >
              Select Document Type to Upload
            </label>
            <div className="relative mt-2 w-full max-w-md">
              <div className="relative">
                <button
                  ref={docButtonRef}
                  type="button"
                  aria-haspopup="listbox"
                  aria-expanded={docDropdownOpen}
                  onClick={() => {
                    setDocDropdownOpen((s) => {
                      const next = !s;
                      if (next) {
                        const init = documentOptions.map((o) => ({
                          ...o,
                          disabled: !!files[o.id],
                        }));
                        const first = init.findIndex(
                          (f) => !f.disabled
                        );
                        setDocHighlight(first >= 0 ? first : 0);
                        setDocSearch("");
                      }
                      return next;
                    });
                  }}
                  onKeyDown={(e) => {
                    if (
                      e.key === "ArrowDown" ||
                      e.key === "Enter" ||
                      e.key === " "
                    ) {
                      e.preventDefault();
                      setDocDropdownOpen(true);
                      setTimeout(
                        () => docListRef.current?.focus?.(),
                        0
                      );
                    }
                  }}
                  className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-left text-sm font-medium text-gray-900 hover:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <div className="flex items-center justify-between">
                    <span>
                      {
                        documentOptions.find(
                          (d) => d.id === selectedDocType
                        )?.label
                      }
                    </span>
                    <svg
                      className={`h-4 w-4 text-gray-500 transform transition-transform ${
                        docDropdownOpen ? "rotate-180" : "rotate-0"
                      }`}
                      viewBox="0 0 20 20"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                      aria-hidden
                    >
                      <path
                        d="M6 8l4 4 4-4"
                        stroke="currentColor"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </div>
                </button>

                {docDropdownOpen && (
                  <div className="absolute left-0 right-0 z-40 mt-2 rounded-xl bg-white border border-gray-200 shadow-lg">
                    <div className="p-2">
                      <input
                        ref={docListRef}
                        type="text"
                        value={docSearch}
                        onChange={(e) => {
                          setDocSearch(e.target.value);
                          const filteredInit = documentOptions
                            .filter((o) =>
                              o.label
                                .toLowerCase()
                                .includes(
                                  e.target.value.toLowerCase()
                                )
                            )
                            .map((o) => ({
                              ...o,
                              disabled: !!files[o.id],
                            }));
                          const first = filteredInit.findIndex(
                            (f) => !f.disabled
                          );
                          setDocHighlight(first >= 0 ? first : 0);
                        }}
                        onKeyDown={(e) => {
                          const filtered = documentOptions
                            .filter((o) =>
                              o.label
                                .toLowerCase()
                                .includes(docSearch.toLowerCase())
                            )
                            .map((o) => ({
                              ...o,
                              disabled: !!files[o.id],
                            }));
                          if (e.key === "ArrowDown") {
                            e.preventDefault();
                            setDocHighlight((h) => {
                              let n = h;
                              for (
                                let i = 0;
                                i < filtered.length;
                                i++
                              ) {
                                n = Math.min(
                                  n + 1,
                                  filtered.length - 1
                                );
                                if (!filtered[n].disabled) return n;
                                if (n === filtered.length - 1)
                                  break;
                              }
                              return h;
                            });
                          } else if (e.key === "ArrowUp") {
                            e.preventDefault();
                            setDocHighlight((h) => {
                              let n = h;
                              for (
                                let i = 0;
                                i < filtered.length;
                                i++
                              ) {
                                n = Math.max(n - 1, 0);
                                if (!filtered[n].disabled) return n;
                                if (n === 0) break;
                              }
                              return h;
                            });
                          } else if (e.key === "Enter") {
                            e.preventDefault();
                            const pick = documentOptions
                              .filter((o) =>
                                o.label
                                  .toLowerCase()
                                  .includes(docSearch.toLowerCase())
                              )
                              .map((o) => ({
                                ...o,
                                disabled: !!files[o.id],
                              }))[docHighlight];
                            if (pick && !pick.disabled) {
                              setSelectedDocType(pick.id);
                              setDocDropdownOpen(false);
                            }
                          } else if (e.key === "Escape") {
                            setDocDropdownOpen(false);
                          }
                        }}
                        placeholder="Search documents..."
                        className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <ul
                      role="listbox"
                      aria-activedescendant={
                        documentOptions[docHighlight]?.id
                      }
                      tabIndex={-1}
                      className="max-h-60 overflow-auto py-2"
                    >
                      {documentOptions
                        .filter((o) =>
                          o.label
                            .toLowerCase()
                            .includes(docSearch.toLowerCase())
                        )
                        .map((opt, idx) => {
                          const disabled = !!files[opt.id];
                          return (
                            <li
                              key={opt.id}
                              id={opt.id}
                              role="option"
                              aria-selected={
                                selectedDocType === opt.id
                              }
                              aria-disabled={disabled}
                              onClick={() => {
                                setSelectedDocType(opt.id);
                                setDocDropdownOpen(false);
                              }}
                              onMouseEnter={() =>
                                setDocHighlight(idx)
                              }
                              className={`px-4 py-2 text-sm cursor-pointer ${
                                selectedDocType === opt.id
                                  ? "bg-blue-50 text-blue-700 font-semibold"
                                  : docHighlight === idx
                                  ? "bg-gray-100"
                                  : "text-gray-700"
                              }`}
                            >
                              {opt.label}
                            </li>
                          );
                        })}
                    </ul>
                  </div>
                )}
              </div>
            </div>

            <div className="mt-3 flex items-start gap-4">
              <div
                role="button"
                tabIndex={0}
                onDrop={(e) => {
                  e.preventDefault();
                  const f = e.dataTransfer.files?.[0];
                  if (f) handleStageFile(f);
                }}
                onDragOver={(e) => e.preventDefault()}
                onClick={() =>
                  document
                    .getElementById("staged-file-input")
                    ?.click()
                }
                className={`flex-1 cursor-pointer rounded-xl border-2 border-dashed p-4 text-center transition-all duration-150 ${
                  errors.staged
                    ? "border-red-400 bg-red-50"
                    : "border-gray-300 bg-white"
                }`}
              >
                <p className="text-sm font-medium text-gray-700">
                  {stagedFile
                    ? stagedFile.name
                    : "Drag & drop a file here or click to browse"}
                </p>
                <p className="mt-1 text-xs text-gray-500">
                  PDF, JPG, JPEG, PNG up to 5MB
                </p>
                <input
                  id="staged-file-input"
                  type="file"
                  accept=".pdf,.jpg,.jpeg,.png"
                  className="hidden"
                  onChange={(e) => {
                    const s = e.target.files?.[0];
                    if (s) handleStageFile(s);
                  }}
                />
              </div>

              <div className="flex flex-col gap-2">
                <button
                  type="button"
                  onClick={handleUploadStaged}
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700"
                >
                  Upload
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setStagedFile(null);
                    setErrors((p) => {
                      const c = { ...p };
                      delete c.staged;
                      return c;
                    });
                  }}
                  className="inline-flex items-center justify-center gap-2 rounded-xl border border-gray-300 px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50"
                >
                  Clear
                </button>
              </div>
            </div>

            {errors.staged && (
              <div className="mt-2 text-sm text-red-600">
                {errors.staged}
              </div>
            )}
          </div>

          <div className="grid gap-4">
            <p className="text-sm font-medium text-gray-700">
              Uploaded Documents
            </p>
            <div className="grid gap-3">
              {errors.documents && (
                <div className="text-sm text-red-600">
                  {errors.documents}
                </div>
              )}
              {documentOptions.map((opt) => {
                const arr = files[opt.id] || [];
                if (!Array.isArray(arr) || arr.length === 0)
                  return null;
                return arr.map((file, idx) => (
                  <div
                    key={`${opt.id}-${idx}`}
                    className="flex items-center justify-between gap-3 rounded-xl border px-4 py-3"
                  >
                    <div className="flex items-center gap-3">
                      <FileText className="h-5 w-5 text-blue-600" />
                      <div>
                        <p className="text-sm font-medium text-gray-800">
                          {opt.label}
                        </p>
                        <p className="text-xs text-gray-500">
                          {file.name}
                          {file.fromDatabase && (
                            <span className="ml-2 text-green-600">
                              ✓ Previously uploaded
                            </span>
                          )}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() =>
                          handleClearUploaded(opt.id, idx)
                        }
                        disabled={loading}
                        className="inline-flex items-center gap-2 rounded-md border border-red-200 px-3 py-2 text-sm font-semibold text-red-600 hover:bg-red-50 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {loading ? (
                          <Loader className="h-4 w-4 animate-spin" />
                        ) : (
                          "Clear"
                        )}
                      </button>
                    </div>
                  </div>
                ));
              })}

              {Object.values(files).every(
                (arr) => !Array.isArray(arr) || arr.length === 0
              ) && (
                <div className="rounded-md border border-dashed border-gray-200 px-4 py-6 text-center text-sm text-gray-500">
                  No documents uploaded yet. Use the dropdown above
                  to select a type and upload a document.
                </div>
              )}
            </div>
          </div>
        </div>
      </section>
    </>
  );
};

export default Step3DocumentUpload;
