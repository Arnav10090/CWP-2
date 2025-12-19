import { useRef } from "react";
import {
  AlertCircle,
  User,
  Loader,
  Globe,
  CheckCircle,
} from "lucide-react";

const languages = [
  { value: "en", label: "English (en)" },
  { value: "hi", label: "Hindi - हिंदी (hi)" },
  { value: "ta", label: "Tamil - தமிழ் (ta)" },
  { value: "te", label: "Telugu - తెలుగు (te)" },
  { value: "kn", label: "Kannada - ಕನ್ನಡ (kn)" },
  { value: "ml", label: "Malayalam - മലയാളം (ml)" },
  { value: "mr", label: "Marathi - मराठी (mr)" },
  { value: "gu", label: "Gujarati - ગુજરાતી (gu)" },
  { value: "bn", label: "Bengali - বাংলা (bn)" },
  { value: "or", label: "Odia - ଓଡ଼ିଆ (or)" },
  { value: "pa", label: "Punjabi - ਪੰਜਾਬੀ (pa)" },
  { value: "as", label: "Assamese - অসমীয়া (as)" },
  { value: "ur", label: "Urdu - اردو (ur)" },
  { value: "sa", label: "Sanskrit - संस्कृत (sa)" },
  { value: "mai", label: "Maithili - मैथिली (mai)" },
];

const Step2DriverInfo = (props) => {
  const {
    formData,
    setFormData,
    handleInputChange,
    errors,
    clearFieldError,
    allDrivers,
    allHelpers,
    driverDropdownOpen,
    setDriverDropdownOpen,
    helperDropdownOpen,
    setHelperDropdownOpen,
    driverSearch,
    setDriverSearch,
    helperSearch,
    setHelperSearch,
    prefDropdownOpen,
    setPrefDropdownOpen,
    prefSearch,
    setPrefSearch,
    prefHighlight,
    setPrefHighlight,
    helperPrefDropdownOpen,
    setHelperPrefDropdownOpen,
    helperPrefSearch,
    setHelperPrefSearch,
    helperPrefHighlight,
    setHelperPrefHighlight,
    savedDriverData,
    savedHelperData,
    driverExists,
    helperExists,
    driverChanged,
    helperChanged,
    driverInputRef,
    driverListRef2,
    helperInputRef,
    helperListRef2,
    prefButtonRef,
    prefListRef,
    helperPrefButtonRef,
    helperPrefListRef,
    handleDriverSelect,
    handleHelperSelect,
    handleSaveDriver,
    handleSaveHelper,
    setShowDriverModal,
    setShowHelperModal,
    savingDriver,
    savingHelper,
    loading,
    autoFillData,
    loadingVehicleData,
  } = props;

  const showDriverFields =
    driverExists ||
    driverChanged ||
    !!(formData.driverName || formData.driverPhone || formData.driverAadhar) ||
    (Array.isArray(allDrivers) && allDrivers.length > 0);

  const showHelperFields =
    helperExists ||
    helperChanged ||
    !!(formData.helperName || formData.helperPhone || formData.helperAadhar) ||
    (Array.isArray(allHelpers) && allHelpers.length > 0);

  return (
    <>
      {loadingVehicleData && (
        <div className="flex items-center gap-3 rounded-xl border border-blue-200 bg-blue-50 px-4 py-3 text-sm text-blue-700">
          <Loader className="h-5 w-5 animate-spin" />
          <span>Loading vehicle history for auto-fill...</span>
        </div>
      )}

      {autoFillData &&
        (autoFillData.driver || autoFillData.helper) && (
          <div className="flex items-start gap-3 rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
            <CheckCircle className="mt-0.5 h-5 w-5 flex-shrink-0" />
            <div>
              <p className="font-semibold">
                Auto-filled from previous submission:
              </p>
              <ul className="mt-1 list-disc list-inside">
                {autoFillData.driver && (
                  <li>Driver: {autoFillData.driver.name}</li>
                )}
                {autoFillData.helper && (
                  <li>Helper: {autoFillData.helper.name}</li>
                )}
              </ul>
              <p className="mt-2 text-xs">
                You can update any field if needed.
              </p>
            </div>
          </div>
        )}
      <div className="grid gap-6 lg:grid-cols-2">
        <section className="rounded-2xl border border-gray-200 bg-gray-50 p-6">
          <div className="flex items-center gap-3">
            <User
              className="h-5 w-5 text-blue-600"
              aria-hidden="true"
            />
            <h2 className="text-lg font-semibold text-gray-800">
              Driver Details
            </h2>
          </div>

          {!showDriverFields && (
            <div className="mt-6">
              <button
                type="button"
                onClick={() => setShowDriverModal(true)}
                disabled={loading || savingDriver}
                className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-green-600 px-4 py-3 text-sm font-semibold text-white transition-all duration-200 hover:bg-green-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:bg-green-300"
              >
                <User className="h-4 w-4" />
                Add New Driver
              </button>
            </div>
          )}

          {showDriverFields && savedDriverData && !driverChanged && (
            <div className="mt-4 flex items-start gap-3 rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
              <CheckCircle className="mt-0.5 h-5 w-5 flex-shrink-0" />
              <div>
                <p className="font-semibold">
                  Using saved driver info
                </p>
                <p className="text-xs mt-1">
                  You can continue with this driver or change the
                  details below
                </p>
              </div>
            </div>
          )}

          {showDriverFields && driverChanged && (
            <div className="mt-4 flex items-start gap-3 rounded-xl border border-yellow-200 bg-yellow-50 px-4 py-3 text-sm text-yellow-700">
              <AlertCircle className="mt-0.5 h-5 w-5 flex-shrink-0" />
              <div>
                <p className="font-semibold">Driver info changed</p>
                <p className="text-xs mt-1">
                  Save the changes or add as a new driver
                </p>
              </div>
            </div>
          )}

          {showDriverFields && (
            <div className="mt-6 grid gap-6">
            <div>
              <label
                htmlFor="driverName"
                className="text-sm font-medium text-gray-700"
              >
                Driver name<span className="text-red-500"> *</span>
              </label>
              <div className="relative mt-2">
                <input
                  ref={driverInputRef}
                  id="driverName"
                  name="driverName"
                  type="text"
                  value={driverSearch || formData.driverName}
                  onChange={(e) => {
                    setDriverSearch(e.target.value);
                    handleInputChange("driverName", e.target.value);
                    setDriverDropdownOpen(true);
                  }}
                  onFocus={() => setDriverDropdownOpen(true)}
                  placeholder="Search or type driver name..."
                  className={`w-full rounded-xl border px-4 py-3 text-sm font-medium text-gray-900 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                    errors.driverName
                      ? "border-red-400 bg-red-50"
                      : "border-gray-300 bg-white"
                  }`}
                  autoComplete="name"
                />
                {driverDropdownOpen && allDrivers.length > 0 && (
                  <div
                    ref={driverListRef2}
                    className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-200 rounded-xl shadow-lg z-50 max-h-60 overflow-y-auto"
                  >
                    {console.log(
                      "Rendering driver dropdown with drivers:",
                      allDrivers
                    )}
                    {allDrivers
                      .filter((driver) =>
                        driverSearch
                          ? driver.name
                              .toLowerCase()
                              .includes(driverSearch.toLowerCase())
                          : true
                      )
                      .map((driver) => (
                        <button
                          type="button"
                          key={driver.id}
                          onClick={() => handleDriverSelect(driver)}
                          className="w-full px-4 py-3 text-left text-sm hover:bg-blue-50 transition-colors border-b last:border-b-0"
                        >
                          <div className="font-medium">
                            {driver.name}
                          </div>
                          <div className="text-xs text-gray-500">
                            {driver.phoneNo} • {driver.uid}
                          </div>
                        </button>
                      ))}
                  </div>
                )}
              </div>
              {errors.driverName && (
                <div className="mt-2 flex items-center gap-2 text-sm text-red-600">
                  <AlertCircle
                    className="h-4 w-4"
                    aria-hidden="true"
                  />
                  <span>{errors.driverName}</span>
                </div>
              )}
            </div>

            <div>
              <label
                htmlFor="driverAadhar"
                className="text-sm font-medium text-gray-700"
              >
                Driver Aadhar No.
                <span className="text-red-500"> *</span>
              </label>
              <input
                id="driverAadhar"
                name="driverAadhar"
                type="text"
                inputMode="numeric"
                value={formData.driverAadhar}
                onChange={(e) =>
                  handleInputChange("driverAadhar", e.target.value)
                }
                placeholder="12-digit Aadhar number"
                readOnly={driverExists && !driverChanged}
                className={`mt-2 w-full rounded-xl border px-4 py-3 text-sm font-medium text-gray-900 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                  driverExists && !driverChanged
                    ? "bg-gray-100"
                    : ""
                } ${
                  errors.driverAadhar
                    ? "border-red-400 bg-red-50"
                    : "border-gray-300 bg-white"
                }`}
                maxLength={12}
              />
              {driverExists && !driverChanged && (
                <p className="mt-1 text-xs text-gray-500">
                  Aadhar number is locked for saved driver
                </p>
              )}
              {errors.driverAadhar && (
                <div className="mt-2 flex items-center gap-2 text-sm text-red-600">
                  <AlertCircle
                    className="h-4 w-4"
                    aria-hidden="true"
                  />
                  <span>{errors.driverAadhar}</span>
                </div>
              )}
            </div>

            <div>
              <label
                htmlFor="driverPhone"
                className="text-sm font-medium text-gray-700"
              >
                Driver Phone no.
                <span className="text-red-500"> *</span>
              </label>
              <input
                id="driverPhone"
                name="driverPhone"
                type="tel"
                inputMode="numeric"
                value={formData.driverPhone}
                onChange={(e) =>
                  handleInputChange("driverPhone", e.target.value)
                }
                placeholder="+91XXXXXXXXXX"
                className={`mt-2 w-full rounded-xl border px-4 py-3 text-sm font-medium text-gray-900 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                  errors.driverPhone
                    ? "border-red-400 bg-red-50"
                    : "border-gray-300 bg-white"
                }`}
              />
              {errors.driverPhone && (
                <div className="mt-2 flex items-center gap-2 text-sm text-red-600">
                  <AlertCircle
                    className="h-4 w-4"
                    aria-hidden="true"
                  />
                  <span>{errors.driverPhone}</span>
                </div>
              )}
            </div>

            <div>
              <label
                htmlFor="driverLanguage"
                className="text-sm font-medium text-gray-700"
              >
                Driver Language
                <span className="text-red-500"> *</span>
              </label>
              <div className="relative mt-2">
                <Globe
                  className="pointer-events-none absolute left-3 top-3.5 h-4 w-4 text-gray-400"
                  aria-hidden="true"
                />
                <div className="relative">
                  <button
                    ref={prefButtonRef}
                    type="button"
                    aria-haspopup="listbox"
                    aria-expanded={prefDropdownOpen}
                    onClick={() => {
                      setPrefDropdownOpen((s) => !s);
                      setPrefHighlight(
                        languages.findIndex(
                          (l) => l.value === formData.driverLanguage
                        )
                      );
                    }}
                    className={`w-full rounded-xl border ${
                      errors.driverLanguage
                        ? "border-red-400 bg-red-50"
                        : "border-gray-300"
                    } bg-white px-4 py-3 text-left text-sm font-medium text-gray-900 hover:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-500`}
                  >
                    <div className="flex items-center gap-2">
                      <Globe className="h-4 w-4 text-gray-400" />
                      <span>
                        {
                          languages.find(
                            (l) =>
                              l.value === formData.driverLanguage
                          )?.label
                        }
                      </span>
                      <svg
                        className={`ml-auto h-4 w-4 text-gray-500 transform ${
                          prefDropdownOpen
                            ? "rotate-180"
                            : "rotate-0"
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
                  {prefDropdownOpen && (
                    <div className="absolute left-0 right-0 z-40 mt-2 rounded-xl bg-white border border-gray-200 shadow-lg">
                      <div className="p-2">
                        <input
                          ref={prefListRef}
                          type="text"
                          value={prefSearch}
                          onChange={(e) => {
                            setPrefSearch(e.target.value);
                            setPrefHighlight(0);
                          }}
                          onKeyDown={(e) => {
                            if (e.key === "ArrowDown") {
                              e.preventDefault();
                              const filtered = languages.filter(
                                (l) =>
                                  l.label
                                    .toLowerCase()
                                    .includes(
                                      prefSearch.toLowerCase()
                                    )
                              );
                              setPrefHighlight((prev) =>
                                Math.min(
                                  prev + 1,
                                  filtered.length - 1
                                )
                              );
                            } else if (e.key === "ArrowUp") {
                              e.preventDefault();
                              setPrefHighlight((prev) =>
                                Math.max(prev - 1, 0)
                              );
                            } else if (e.key === "Enter") {
                              e.preventDefault();
                              const filtered = languages.filter(
                                (l) =>
                                  l.label
                                    .toLowerCase()
                                    .includes(
                                      prefSearch.toLowerCase()
                                    )
                              );
                              if (filtered[prefHighlight]) {
                                handleInputChange(
                                  "driverLanguage",
                                  filtered[prefHighlight].value
                                );
                                setPrefDropdownOpen(false);
                                setPrefSearch("");
                              }
                            }
                          }}
                          placeholder="Search languages..."
                          className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                      <ul
                        role="listbox"
                        aria-activedescendant={
                          languages.filter((l) =>
                            l.label
                              .toLowerCase()
                              .includes(prefSearch.toLowerCase())
                          )[prefHighlight]?.value
                        }
                        tabIndex={-1}
                        className="max-h-60 overflow-auto py-2"
                      >
                        {languages
                          .filter((l) =>
                            l.label
                              .toLowerCase()
                              .includes(prefSearch.toLowerCase())
                          )
                          .map((opt, idx) => (
                            <li
                              key={opt.value}
                              role="option"
                              aria-selected={
                                formData.driverLanguage ===
                                opt.value
                              }
                              onClick={() => {
                                handleInputChange(
                                  "driverLanguage",
                                  opt.value
                                );
                                setPrefDropdownOpen(false);
                                setPrefSearch("");
                              }}
                              onMouseEnter={() =>
                                setPrefHighlight(idx)
                              }
                              className={`cursor-pointer px-4 py-2 text-sm ${
                                formData.driverLanguage ===
                                opt.value
                                  ? "bg-blue-50 text-blue-700 font-semibold"
                                  : prefHighlight === idx
                                  ? "bg-gray-100"
                                  : "text-gray-700"
                              }`}
                            >
                              {opt.label}
                            </li>
                          ))}
                      </ul>
                    </div>
                  )}
                </div>
              </div>
              {errors.driverLanguage && (
                <div className="mt-2 flex items-center gap-2 text-sm text-red-600">
                  <AlertCircle
                    className="h-4 w-4"
                    aria-hidden="true"
                  />
                  <span>{errors.driverLanguage}</span>
                </div>
              )}
            </div>

            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={handleSaveDriver}
                disabled={
                  savingDriver || (!driverChanged && driverExists)
                }
                className="hidden inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-3 text-sm font-semibold text-white transition-all duration-200 hover:bg-blue-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:bg-blue-300"
              >
                {savingDriver ? (
                  <>
                    <Loader className="h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <User className="h-4 w-4" />
                    Save Driver Info
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={() => setShowDriverModal(true)}
                disabled={loading || savingDriver}
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-green-600 px-4 py-3 text-sm font-semibold text-white transition-all duration-200 hover:bg-green-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:bg-green-300"
              >
                <User className="h-4 w-4" />
                Add New Driver
              </button>
            </div>
            <p className="text-xs text-gray-500">
              {driverChanged
                ? "Save to update existing driver or Add New to create a separate entry"
                : driverExists
                ? "Driver info is saved. Change any field to update."
                : "Fill in driver details and save or add as new"}
            </p>
          </div>
          )}
        </section>

        <section className="rounded-2xl border border-gray-200 bg-gray-50 p-6">
          <div className="flex items-center gap-3">
            <User
              className="h-5 w-5 text-blue-600"
              aria-hidden="true"
            />
            <h2 className="text-lg font-semibold text-gray-800">
              Helper Details
            </h2>
          </div>

          {!showHelperFields && (
            <div className="mt-6">
              <button
                type="button"
                onClick={() => setShowHelperModal(true)}
                disabled={loading || savingHelper}
                className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-green-600 px-4 py-3 text-sm font-semibold text-white transition-all duration-200 hover:bg-green-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:bg-green-300"
              >
                <User className="h-4 w-4" />
                Add New Helper
              </button>
            </div>
          )}

          {showHelperFields && savedHelperData && !helperChanged && (
            <div className="mt-4 flex items-start gap-3 rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
              <CheckCircle className="mt-0.5 h-5 w-5 flex-shrink-0" />
              <div>
                <p className="font-semibold">
                  Using saved helper info
                </p>
                <p className="text-xs mt-1">
                  You can continue with this helper or change the
                  details below
                </p>
              </div>
            </div>
          )}

          {showHelperFields && helperChanged && (
            <div className="mt-4 flex items-start gap-3 rounded-xl border border-yellow-200 bg-yellow-50 px-4 py-3 text-sm text-yellow-700">
              <AlertCircle className="mt-0.5 h-5 w-5 flex-shrink-0" />
              <div>
                <p className="font-semibold">Helper info changed</p>
                <p className="text-xs mt-1">
                  Save the changes or add as a new helper
                </p>
              </div>
            </div>
          )}

          {showHelperFields && (
            <div className="mt-6 grid gap-6">
            <div>
              <label
                htmlFor="helperName"
                className="text-sm font-medium text-gray-700"
              >
                Helper name<span className="text-red-500"> *</span>
              </label>
              <div className="relative mt-2">
                <input
                  ref={helperInputRef}
                  id="helperName"
                  name="helperName"
                  type="text"
                  value={helperSearch || formData.helperName}
                  onChange={(e) => {
                    setHelperSearch(e.target.value);
                    handleInputChange("helperName", e.target.value);
                    setHelperDropdownOpen(true);
                  }}
                  onFocus={() => setHelperDropdownOpen(true)}
                  placeholder="Search or type helper name..."
                  className={`w-full rounded-xl border px-4 py-3 text-sm font-medium text-gray-900 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                    errors.helperName
                      ? "border-red-400 bg-red-50"
                      : "border-gray-300 bg-white"
                  }`}
                  autoComplete="name"
                />
                {helperDropdownOpen && allHelpers.length > 0 && (
                  <div
                    ref={helperListRef2}
                    className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-200 rounded-xl shadow-lg z-50 max-h-60 overflow-y-auto"
                  >
                    {allHelpers
                      .filter((helper) =>
                        helperSearch
                          ? helper.name
                              .toLowerCase()
                              .includes(helperSearch.toLowerCase())
                          : true
                      )
                      .map((helper) => (
                        <button
                          type="button"
                          key={helper.id}
                          onClick={() => handleHelperSelect(helper)}
                          className="w-full px-4 py-3 text-left text-sm hover:bg-blue-50 transition-colors border-b last:border-b-0"
                        >
                          <div className="font-medium">
                            {helper.name}
                          </div>
                          <div className="text-xs text-gray-500">
                            {helper.phoneNo} • {helper.uid}
                          </div>
                        </button>
                      ))}
                  </div>
                )}
              </div>
              {errors.helperName && (
                <div className="mt-2 flex items-center gap-2 text-sm text-red-600">
                  <AlertCircle
                    className="h-4 w-4"
                    aria-hidden="true"
                  />
                  <span>{errors.helperName}</span>
                </div>
              )}
            </div>

            <div>
              <label
                htmlFor="helperAadhar"
                className="text-sm font-medium text-gray-700"
              >
                Helper Aadhar No.
                <span className="text-red-500"> *</span>
              </label>
              <input
                id="helperAadhar"
                name="helperAadhar"
                type="text"
                inputMode="numeric"
                value={formData.helperAadhar}
                onChange={(e) =>
                  handleInputChange("helperAadhar", e.target.value)
                }
                placeholder="12-digit Aadhar number"
                readOnly={helperExists && !helperChanged}
                className={`mt-2 w-full rounded-xl border px-4 py-3 text-sm font-medium text-gray-900 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                  helperExists && !helperChanged
                    ? "bg-gray-100"
                    : ""
                } ${
                  errors.helperAadhar
                    ? "border-red-400 bg-red-50"
                    : "border-gray-300 bg-white"
                }`}
                maxLength={12}
              />
              {helperExists && !helperChanged && (
                <p className="mt-1 text-xs text-gray-500">
                  Aadhar number is locked for saved helper
                </p>
              )}
              {errors.helperAadhar && (
                <div className="mt-2 flex items-center gap-2 text-sm text-red-600">
                  <AlertCircle
                    className="h-4 w-4"
                    aria-hidden="true"
                  />
                  <span>{errors.helperAadhar}</span>
                </div>
              )}
            </div>

            <div>
              <label
                htmlFor="helperPhone"
                className="text-sm font-medium text-gray-700"
              >
                Helper Phone no.
                <span className="text-red-500"> *</span>
              </label>
              <input
                id="helperPhone"
                name="helperPhone"
                type="tel"
                inputMode="numeric"
                value={formData.helperPhone}
                onChange={(e) =>
                  handleInputChange("helperPhone", e.target.value)
                }
                placeholder="+91XXXXXXXXXX"
                className={`mt-2 w-full rounded-xl border px-4 py-3 text-sm font-medium text-gray-900 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                  errors.helperPhone
                    ? "border-red-400 bg-red-50"
                    : "border-gray-300 bg-white"
                }`}
              />
              {errors.helperPhone && (
                <div className="mt-2 flex items-center gap-2 text-sm text-red-600">
                  <AlertCircle
                    className="h-4 w-4"
                    aria-hidden="true"
                  />
                  <span>{errors.helperPhone}</span>
                </div>
              )}
            </div>

            <div>
              <label
                htmlFor="helperLanguage"
                className="text-sm font-medium text-gray-700"
              >
                Helper Language
                <span className="text-red-500"> *</span>
              </label>
              <div className="relative mt-2">
                <Globe
                  className="pointer-events-none absolute left-3 top-3.5 h-4 w-4 text-gray-400"
                  aria-hidden="true"
                />
                <div className="relative">
                  <button
                    ref={helperPrefButtonRef}
                    type="button"
                    aria-haspopup="listbox"
                    aria-expanded={helperPrefDropdownOpen}
                    onClick={() => {
                      setHelperPrefDropdownOpen((s) => !s);
                      setHelperPrefHighlight(
                        languages.findIndex(
                          (l) => l.value === formData.helperLanguage
                        )
                      );
                    }}
                    className={`w-full rounded-xl border ${
                      errors.helperLanguage
                        ? "border-red-400 bg-red-50"
                        : "border-gray-300"
                    } bg-white px-4 py-3 text-left text-sm font-medium text-gray-900 hover:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-500`}
                  >
                    <div className="flex items-center gap-2">
                      <Globe className="h-4 w-4 text-gray-400" />
                      <span>
                        {
                          languages.find(
                            (l) =>
                              l.value === formData.helperLanguage
                          )?.label
                        }
                      </span>
                      <svg
                        className={`ml-auto h-4 w-4 text-gray-500 transform ${
                          helperPrefDropdownOpen
                            ? "rotate-180"
                            : "rotate-0"
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
                  {helperPrefDropdownOpen && (
                    <div className="absolute left-0 right-0 z-40 mt-2 rounded-xl bg-white border border-gray-200 shadow-lg">
                      <div className="p-2">
                        <input
                          ref={helperPrefListRef}
                          type="text"
                          value={helperPrefSearch}
                          onChange={(e) => {
                            setHelperPrefSearch(e.target.value);
                            setHelperPrefHighlight(0);
                          }}
                          onKeyDown={(e) => {
                            if (e.key === "ArrowDown") {
                              e.preventDefault();
                              const filtered = languages.filter(
                                (l) =>
                                  l.label
                                    .toLowerCase()
                                    .includes(
                                      helperPrefSearch.toLowerCase()
                                    )
                              );
                              setHelperPrefHighlight((prev) =>
                                Math.min(
                                  prev + 1,
                                  filtered.length - 1
                                )
                              );
                            } else if (e.key === "ArrowUp") {
                              e.preventDefault();
                              setHelperPrefHighlight((prev) =>
                                Math.max(prev - 1, 0)
                              );
                            } else if (e.key === "Enter") {
                              e.preventDefault();
                              const filtered = languages.filter(
                                (l) =>
                                  l.label
                                    .toLowerCase()
                                    .includes(
                                      helperPrefSearch.toLowerCase()
                                    )
                              );
                              if (filtered[helperPrefHighlight]) {
                                handleInputChange(
                                  "helperLanguage",
                                  filtered[helperPrefHighlight]
                                    .value
                                );
                                setHelperPrefDropdownOpen(false);
                                setHelperPrefSearch("");
                              }
                            }
                          }}
                          placeholder="Search languages..."
                          className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                      <ul
                        role="listbox"
                        aria-activedescendant={
                          languages.filter((l) =>
                            l.label
                              .toLowerCase()
                              .includes(
                                helperPrefSearch.toLowerCase()
                              )
                          )[helperPrefHighlight]?.value
                        }
                        tabIndex={-1}
                        className="max-h-60 overflow-auto py-2"
                      >
                        {languages
                          .filter((l) =>
                            l.label
                              .toLowerCase()
                              .includes(
                                helperPrefSearch.toLowerCase()
                              )
                          )
                          .map((opt, idx) => (
                            <li
                              key={opt.value}
                              role="option"
                              aria-selected={
                                formData.helperLanguage ===
                                opt.value
                              }
                              onClick={() => {
                                handleInputChange(
                                  "helperLanguage",
                                  opt.value
                                );
                                setHelperPrefDropdownOpen(false);
                                setHelperPrefSearch("");
                              }}
                              onMouseEnter={() =>
                                setHelperPrefHighlight(idx)
                              }
                              className={`cursor-pointer px-4 py-2 text-sm ${
                                formData.helperLanguage ===
                                opt.value
                                  ? "bg-blue-50 text-blue-700 font-semibold"
                                  : helperPrefHighlight === idx
                                  ? "bg-gray-100"
                                  : "text-gray-700"
                              }`}
                            >
                              {opt.label}
                            </li>
                          ))}
                      </ul>
                    </div>
                  )}
                </div>
              </div>
              {errors.helperLanguage && (
                <div className="mt-2 flex items-center gap-2 text-sm text-red-600">
                  <AlertCircle
                    className="h-4 w-4"
                    aria-hidden="true"
                  />
                  <span>{errors.helperLanguage}</span>
                </div>
              )}
            </div>

            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={handleSaveHelper}
                disabled={
                  savingHelper || (!helperChanged && helperExists)
                }
                className="hidden inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-3 text-sm font-semibold text-white transition-all duration-200 hover:bg-blue-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:bg-blue-300"
              >
                {savingHelper ? (
                  <>
                    <Loader className="h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <User className="h-4 w-4" />
                    Save Helper Info
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={() => setShowHelperModal(true)}
                disabled={loading || savingHelper}
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-green-600 px-4 py-3 text-sm font-semibold text-white transition-all duration-200 hover:bg-green-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:bg-green-300"
              >
                <User className="h-4 w-4" />
                Add New Helper
              </button>
            </div>
            <p className="text-xs text-gray-500">
              {helperChanged
                ? "Save to update existing helper or Add New to create a separate entry"
                : helperExists
                ? "Helper info is saved. Change any field to update."
                : "Fill in helper details and save or add as new"}
            </p>
          </div>
          )}
        </section>
      </div>
    </>
  );
};

export default Step2DriverInfo;
