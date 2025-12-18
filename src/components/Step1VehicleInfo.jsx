import { useRef } from "react";
import {
  AlertCircle,
  FileText,
  Loader,
  Truck,
  ChevronDown,
} from "lucide-react";

const Step1VehicleInfo = ({
  formData,
  setFormData,
  handleInputChange,
  errors,
  clearFieldError,
  vehicles,
  setVehicles,
  myVehicles,
  vehicleDropdownOpen,
  setVehicleDropdownOpen,
  vehicleSearch,
  setVehicleSearch,
  loadingVehicles,
  selectedVehicle,
  setSelectedVehicle,
  loadingVehicleData,
  vehicleRatings,
  poNumbers,
  poDropdownOpen,
  setPoDropdownOpen,
  poSearch,
  setPoSearch,
  loadingPos,
  dapName,
  loadingDap,
  vehicleInputRef,
  vehicleListRef,
  poInputRef,
  poListRef,
  handleVehicleSelect,
  handlePONumberBlur,
  validateVehicleNumber,
  validatePoNumber,
}) {
  return (
    <>
      <section className="rounded-2xl border border-gray-200 bg-gray-50 p-6">
        <div className="flex items-center gap-3">
          <div className="h-5 w-5 text-blue-600">👤</div>
          <h2 className="text-lg font-semibold text-gray-800">
            Customer Details
          </h2>
        </div>
        <div className="mt-6 grid gap-6 lg:grid-cols-2">
          <div>
            <label
              htmlFor="customerEmail"
              className="text-sm font-medium text-gray-700"
            >
              Email ID<span className="text-red-500"> *</span>
            </label>
            <input
              id="customerEmail"
              name="customerEmail"
              type="email"
              value={formData.customerEmail}
              readOnly
              placeholder="you@example.com"
              className={`mt-2 w-full rounded-xl border px-4 py-3 text-sm font-semibold text-gray-900 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 cursor-not-allowed bg-gray-100 ${
                errors.customerEmail
                  ? "border-red-400 bg-red-50 placeholder:text-red-400"
                  : "border-gray-300"
              }`}
              autoComplete="email"
            />
            {errors.customerEmail && (
              <div className="mt-2 flex items-center gap-2 text-sm text-red-600">
                <AlertCircle
                  className="h-4 w-4"
                  aria-hidden="true"
                />
                <span>{errors.customerEmail}</span>
              </div>
            )}
          </div>
          <div>
            <label
              htmlFor="customerPhone"
              className="text-sm font-medium text-gray-700"
            >
              Phone Number<span className="text-red-500"> *</span>
            </label>
            <input
              id="customerPhone"
              name="customerPhone"
              type="tel"
              inputMode="numeric"
              value={formData.customerPhone}
              readOnly
              placeholder="+91XXXXXXXXXX"
              className={`mt-2 w-full rounded-xl border px-4 py-3 text-sm font-medium text-gray-900 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 cursor-not-allowed bg-gray-100 ${
                errors.customerPhone
                  ? "border-red-400 bg-red-50 placeholder:text-red-400"
                  : "border-gray-300"
              }`}
            />
            {errors.customerPhone && (
              <div className="mt-2 flex items-center gap-2 text-sm text-red-600">
                <AlertCircle
                  className="h-4 w-4"
                  aria-hidden="true"
                />
                <span>{errors.customerPhone}</span>
              </div>
            )}
          </div>
        </div>
      </section>

      <div className="grid gap-6 lg:grid-cols-2">
        <section className="rounded-2xl border border-gray-200 bg-gray-50 p-6">
          <div className="flex items-center gap-3">
            <FileText
              className="h-5 w-5 text-blue-600"
              aria-hidden="true"
            />
            <h2 className="text-lg font-semibold text-gray-800">
              PO Details
            </h2>
          </div>
          <div className="mt-6 grid gap-6">
            <div>
              <label className="text-sm font-medium text-gray-700">
                PO Number<span className="text-red-500"> *</span>
              </label>
              {loadingPos ? (
                <div className="mt-2 flex items-center gap-2 text-sm text-blue-600">
                  <Loader className="h-4 w-4 animate-spin" />
                  <span>Loading your PO numbers...</span>
                </div>
              ) : (
                <>
                  {poNumbers.length === 0 && (
                    <p className="mt-2 mb-3 text-sm text-gray-500">
                      No previously registered PO numbers found. You
                      can enter a new PO number below.
                    </p>
                  )}
                  <div className="relative mt-2">
                    <input
                      ref={poInputRef}
                      type="text"
                      placeholder="Search or type PO number..."
                      value={String(poSearch || "")}
                      onChange={(e) => {
                        const value = e.target.value;
                        setPoSearch(value);
                        setFormData((prev) => ({
                          ...prev,
                          poNumber: value,
                        }));
                        setPoDropdownOpen(true);
                      }}
                      onFocus={() => setPoDropdownOpen(true)}
                      onBlur={() => {
                        if (poSearch) {
                          setFormData((prev) => ({
                            ...prev,
                            poNumber: poSearch,
                          }));
                        }
                      }}
                      className={`mt-2 w-full rounded-xl border px-4 py-3 text-sm font-semibold tracking-wide text-gray-900 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                        errors.poNumber
                          ? "border-red-400 bg-red-50 placeholder:text-red-400"
                          : "border-gray-300 bg-white"
                      }`}
                      autoComplete="off"
                    />
                    <ChevronDown className="absolute right-4 top-5 h-4 w-4 text-gray-400 pointer-events-none" />

                    {poDropdownOpen && poNumbers.length > 0 && (
                      <div
                        ref={poListRef}
                        className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-200 rounded-xl shadow-lg z-50 max-h-60 overflow-y-auto"
                      >
                        {poNumbers
                          .filter((po) => {
                            const poId = String(
                              po?.id || ""
                            ).toLowerCase();
                            const searchTerm = String(
                              poSearch || ""
                            ).toLowerCase();
                            return poId.includes(searchTerm);
                          })
                          .map((po) => (
                            <button
                              type="button"
                              key={po.id}
                              onClick={(e) => {
                                e.preventDefault();
                                const poValue = String(po.id);
                                setPoSearch(poValue);
                                setPoDropdownOpen(false);
                                setFormData((prev) => {
                                  const updated = {
                                    ...prev,
                                    poNumber: poValue,
                                  };
                                  setTimeout(() => handlePONumberBlur(poValue), 0);
                                  return updated;
                                });
                                clearFieldError("poNumber");
                              }}
                              className="w-full px-4 py-3 text-left text-sm hover:bg-blue-50 transition-colors border-b last:border-b-0 disabled:opacity-50"
                            >
                              {po.id}
                            </button>
                          ))}
                      </div>
                    )}
                  </div>
                </>
              )}
              {errors.poNumber && (
                <div className="mt-2 flex items-center gap-2 text-sm text-red-600">
                  <AlertCircle
                    className="h-4 w-4"
                    aria-hidden="true"
                  />
                  <span>{errors.poNumber}</span>
                </div>
              )}
            </div>
            <div>
              <label
                htmlFor="dapName"
                className="text-sm font-medium text-gray-700"
              >
                Delivery At Place (DAP)
              </label>
              <div className="mt-2 relative">
                <input
                  id="dapName"
                  name="dapName"
                  type="text"
                  value={dapName}
                  readOnly
                  placeholder="DAP"
                  className="w-full rounded-xl border border-gray-300 bg-gray-100 px-4 py-3 text-sm font-medium text-gray-900 cursor-not-allowed"
                />
                {loadingDap && (
                  <div className="absolute right-4 top-3">
                    <Loader className="h-4 w-4 animate-spin text-blue-600" />
                  </div>
                )}
              </div>
            </div>
          </div>
        </section>

        <section className="rounded-2xl border border-gray-200 bg-gray-50 p-6">
          <div className="flex items-center gap-3">
            <Truck
              className="h-5 w-5 text-blue-600"
              aria-hidden="true"
            />
            <h2 className="text-lg font-semibold text-gray-800">
              Vehicle Information
            </h2>
          </div>
          <div className="mt-6 grid gap-6">
            <div>
              <label className="text-sm font-medium text-gray-700">
                Vehicle Number
                <span className="text-red-500"> *</span>
              </label>
              {loadingVehicles ? (
                <div className="mt-2 flex items-center gap-2 text-sm text-blue-600">
                  <Loader className="h-4 w-4 animate-spin" />
                  <span>Loading your vehicles...</span>
                </div>
              ) : (
                <>
                  {vehicles.length === 0 && (
                    <p className="mt-2 mb-3 text-sm text-gray-500">
                      No previously registered vehicles found. You
                      can enter a new vehicle number below.
                    </p>
                  )}
                  <div className="relative mt-2">
                    <input
                      ref={vehicleInputRef}
                      type="text"
                      placeholder="Search or type vehicle number..."
                      value={vehicleSearch}
                      onChange={(e) => {
                        setVehicleSearch(e.target.value);
                        setFormData((prev) => ({
                          ...prev,
                          vehicleNumber: e.target.value,
                        }));
                        setVehicleDropdownOpen(true);
                      }}
                      onFocus={() => setVehicleDropdownOpen(true)}
                      onBlur={() => {
                        if (vehicleSearch && !selectedVehicle) {
                          setFormData((prev) => ({
                            ...prev,
                            vehicleNumber: vehicleSearch,
                          }));
                        }
                      }}
                      className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm font-medium text-gray-900 transition-all duration-200 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                    />
                    <ChevronDown className="absolute right-4 top-3.5 h-4 w-4 text-gray-400 pointer-events-none" />

                    {vehicleDropdownOpen && vehicles.length > 0 && (
                      <div
                        ref={vehicleListRef}
                        className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-200 rounded-xl shadow-lg z-50 max-h-60 overflow-y-auto"
                      >
                        {vehicles
                          .filter((v) => {
                            const vehicleNo = String(
                              v?.vehicleRegistrationNo || ""
                            ).toLowerCase();
                            const searchTerm = String(
                              vehicleSearch || ""
                            ).toLowerCase();
                            return vehicleNo.includes(searchTerm);
                          })
                          .map((vehicle) => (
                            <button
                              type="button"
                              key={vehicle.id}
                              onClick={async (e) => {
                                e.preventDefault();
                                setSelectedVehicle(vehicle);
                                setVehicleSearch(
                                  vehicle.vehicleRegistrationNo
                                );
                                setVehicleDropdownOpen(false);
                                setFormData((prev) => ({
                                  ...prev,
                                  vehicleNumber:
                                    vehicle.vehicleRegistrationNo,
                                }));
                                await handleVehicleSelect(
                                  vehicle.vehicleRegistrationNo
                                );
                              }}
                              disabled={loadingVehicleData}
                              className="w-full px-4 py-3 text-left text-sm hover:bg-blue-50 transition-colors border-b last:border-b-0 disabled:opacity-50"
                            >
                              {vehicle.vehicleRegistrationNo}
                              {vehicle.remark && (
                                <span className="text-xs text-gray-500 ml-2">
                                  ({vehicle.remark})
                                </span>
                              )}
                            </button>
                          ))}
                      </div>
                    )}
                  </div>
                </>
              )}
              {errors.vehicleNumber && (
                <div className="mt-2 flex items-center gap-2 text-sm text-red-600">
                  <AlertCircle
                    aria-hidden="true"
                  />
                  <span>{errors.vehicleNumber}</span>
                </div>
              )}
              {loadingVehicleData && (
                <div className="mt-2 flex items-center gap-2 text-sm text-blue-600">
                  <Loader className="h-4 w-4 animate-spin" />
                  <span>Loading vehicle data...</span>
                </div>
              )}
            </div>

            <div>
              <label
                htmlFor="vehicleRatings"
                className="text-sm font-medium text-gray-700"
              >
                Ratings
              </label>
              <input
                id="vehicleRatings"
                name="vehicleRatings"
                type="text"
                value={formData.vehicleRatings}
                readOnly
                placeholder="Ratings will auto-fill"
                className="mt-2 w-full rounded-xl border border-gray-300 bg-gray-100 px-4 py-3 text-sm font-medium text-gray-900 cursor-not-allowed"
              />
            </div>
          </div>
        </section>
      </div>
    </>
  );
};

export default Step1VehicleInfo;