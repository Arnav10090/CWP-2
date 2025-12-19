import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  AlertCircle,
  CheckCircle,
  Download,
  FileText,
  Globe,
  LogOut,
  Loader,
  Phone,
  RefreshCw,
  Scan,
  Send,
  X,
  Truck,
  Upload,
  User,
  ChevronDown,
  ChevronLeft,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import {
  submissionsAPI,
  documentsAPI,
  driversAPI,
  vehiclesAPI,
  poDetailsAPI,
} from "../services/api";
import DriverHelperModal from "./DriverHelperModal";
import Step1VehicleInfo from "./Step1VehicleInfo";
import Step2DriverInfo from "./Step2DriverInfo";
import Step3DocumentUpload from "./Step3DocumentUpload";

const MAX_FILE_SIZE = 5 * 1024 * 1024;
const ACCEPTED_TYPES = [
  "application/pdf",
  "image/jpeg",
  "image/png",
  "image/jpg",
];

const compareDriverHelperData = (data1, data2) => {
  if (!data1 || !data2) return false;

  return (
    (data1.driverName || "") === (data2.driverName || "") &&
    (data1.driverPhone || "") === (data2.driverPhone || "") &&
    (data1.driverLanguage || "en") === (data2.driverLanguage || "en") &&
    (data1.driverAadhar || "") === (data2.driverAadhar || "") &&
    (data1.helperName || "") === (data2.helperName || "") &&
    (data1.helperPhone || "") === (data2.helperPhone || "") &&
    (data1.helperLanguage || "en") === (data2.helperLanguage || "en") &&
    (data1.helperAadhar || "") === (data2.helperAadhar || "")
  );
};

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

 const docTypeMapping = {
   vehicle_registration: "vehicleRegistration",
   vehicle_insurance: "vehicleInsurance",
   vehicle_puc: "vehiclePuc",
   driver_aadhar: "driverAadhar",
   helper_aadhar: "helperAadhar",
   po: "po",
   do: "do",
   before_weighing: "beforeWeighing",
   after_weighing: "afterWeighing",
 };

const steps = [
  {
    id: 0,
    title: "Vehicle Information",
    description: "Identify the vehicle entering the facility",
  },
  {
    id: 1,
    title: "Driver Information",
    description: "Capture driver contact preferences",
  },
  {
    id: 2,
    title: "Document Uploads",
    description: "Provide mandatory verification documents",
  },
];

const initialFormData = {
  vehicleNumber: "",
  poNumber: "",
  customerEmail: "",
  customerPhone: "",
  driverPhone: "",
  driverName: "",
  driverAadhar: "",
  helperPhone: "",
  helperName: "",
  helperAadhar: "",
  driverLanguage: "en",
  helperLanguage: "en",
  vehicleRatings: "",
};

const initialFiles = {
  purchaseOrder: [],
  vehiclePapers: [],
  aadhaarCard: [],
};

documentOptions.forEach((opt) => {
  if (!(opt.id in initialFiles)) {
    initialFiles[opt.id] = [];
  }
});

const validateVehicleNumber = (value) => {
  if (!value.trim()) {
    return "Vehicle number is required.";
  }

  const trimmed = value.trim().toUpperCase();
  const cleaned = trimmed.replace(/[\s-]/g, "");

  const standardFormat = /^[A-Z]{2}\d{2}[A-Z]{1,2}\d{4}$/;
  const tempFormat = /^\d{2}\d{2}TEMP\d{4}$/;
  const specialFormat = /^(CC|CD|UN)\d{4}$/;
  const armyFormat = /^[↑△▲]\d{2}[A-Z]\d{5}$/;
  const bharatFormat = /^\d{2}BH\d{4}[A-Z]{2}$/;
  const vaFormat = /^[A-Z]{2}VA\d{4,5}$/;

  const isValid =
    standardFormat.test(cleaned) ||
    tempFormat.test(cleaned) ||
    specialFormat.test(cleaned) ||
    armyFormat.test(cleaned) ||
    bharatFormat.test(cleaned) ||
    vaFormat.test(cleaned);

  if (!isValid) {
    return "Invalid vehicle number format";
  }

  if (trimmed.length < 4 || trimmed.length > 20) {
    return "Vehicle number must be between 4 and 20 characters.";
  }

  return "";
};

const validatePhone = (value, label) => {
  if (!value) {
    return `${label} is required.`;
  }
  if (!/^\+91\d{10}$/.test(value)) {
    return `${label} must follow +91XXXXXXXXXX format.`;
  }
  return "";
};

const validateEmail = (value) => {
  if (!value || !value.trim()) {
    return "Email is required.";
  }
  const trimmed = value.trim();
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(trimmed)) {
    return "Enter a valid email address.";
  }
  return "";
};

const validatePoNumber = (value) => {
  if (!value || typeof value !== "string" || !value.trim()) {
    return "PO number is required.";
  }
  if (value.trim().length < 2 || value.trim().length > 50) {
    return "PO number must be between 2 and 50 characters.";
  }
  return "";
};

const validateHelperPhone = (value) => {
  if (!value) {
    return "Helper phone number is required.";
  }
  if (!/^\+91\d{10}$/.test(value)) {
    return "Helper phone must follow +91XXXXXXXXXX format.";
  }
  return "";
};

const validateFile = (file, label) => {
  if (!file) {
    return `${label} is required.`;
  }
  if (!ACCEPTED_TYPES.includes(file.type)) {
    return `${label} must be a PDF, JPG, JPEG, or PNG file.`;
  }
  if (file.size > MAX_FILE_SIZE) {
    return `${label} must be 5MB or smaller.`;
  }
  return "";
};

const validateAadhar = (value, label) => {
  if (!value || !value.trim()) {
    return `${label} is required.`;
  }
  if (!/^\d{12}$/.test(value.trim())) {
    return `${label} must be exactly 12 digits.`;
  }
  return "";
};

const mergeDocuments = (existingFiles, newDocuments, docTypeMapping) => {
  const updatedFiles = { ...existingFiles };
  
  newDocuments.forEach((doc) => {
    const frontendType = docTypeMapping[doc.type];
    if (frontendType) {
      const fileObj = {
        name: doc.name || `${doc.type_display}.pdf`,
        documentId: doc.id,
        filePath: doc.filePath,
        type: "application/pdf",
        size: 0,
        uploaded: true,
        fromDatabase: true,
      };

      if (!updatedFiles[frontendType]) {
        updatedFiles[frontendType] = [];
      }
      
      // Check if document already exists
      const exists = updatedFiles[frontendType].some(
        f => f.documentId === doc.id
      );
      
      if (!exists) {
        updatedFiles[frontendType] = [...updatedFiles[frontendType], fileObj];
      }
    }
  });
  
  return updatedFiles;
};

const DocumentUploadField = ({
  id,
  label,
  description,
  file,
  onFileSelect,
  error,
}) => {
  const inputRef = useRef(null);

  const handleFileChange = (event) => {
    const selected = event.target.files?.[0];
    if (selected) {
      onFileSelect(id, selected);
    }
  };

  const handleDrop = (event) => {
    event.preventDefault();
    const dropped = event.dataTransfer.files?.[0];
    if (dropped) {
      onFileSelect(id, dropped);
    }
  };

  const handleDragOver = (event) => {
    event.preventDefault();
  };

  const triggerBrowse = (event) => {
    event.preventDefault();
    inputRef.current?.click();
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <FileText className="h-5 w-5 text-blue-600" aria-hidden="true" />
        <label
          htmlFor={`${id}-input`}
          className="text-sm font-semibold text-gray-800"
        >
          {label}
          <span className="text-red-500"> *</span>
        </label>
      </div>
      <p className="text-sm text-gray-500">{description}</p>
      <div
        role="button"
        tabIndex={0}
        onClick={triggerBrowse}
        onKeyDown={(event) => {
          if (event.key === "Enter" || event.key === " ") {
            triggerBrowse(event);
          }
        }}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        className={`flex flex-col items-center justify-center rounded-xl border-2 border-dashed bg-gray-50 p-6 text-center transition-all duration-200 hover:border-blue-400 hover:bg-white focus-visible:border-blue-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 ${
          error ? "border-red-400 bg-red-50" : "border-gray-300"
        }`}
      >
        <Upload className="h-8 w-8 text-blue-500" aria-hidden="true" />
        <p className="mt-2 text-sm font-medium text-gray-700">
          Drag & drop or <span className="text-blue-600">browse files</span>
        </p>
        <p className="mt-1 text-xs text-gray-500">
          PDF, JPG, JPEG, PNG up to 5MB
        </p>
        {file && (
          <div className="mt-4 flex items-center gap-2 rounded-lg bg-green-50 px-3 py-2">
            <CheckCircle
              className="h-5 w-5 text-green-500"
              aria-hidden="true"
            />
            <span
              className="text-sm font-medium text-green-700"
              title={file.name}
            >
              {file.name}
            </span>
          </div>
        )}
      </div>
      <input
        id={`${id}-input`}
        ref={inputRef}
        name={id}
        type="file"
        accept=".pdf,.jpg,.jpeg,.png"
        className="hidden"
        onChange={handleFileChange}
      />
      {error && (
        <div className="flex items-center gap-2 text-sm text-red-600">
          <AlertCircle className="h-4 w-4" aria-hidden="true" />
          <span>{error}</span>
        </div>
      )}
    </div>
  );
};

const CustomerPortal = () => {
  const { logout, user } = useAuth();

  const storageId = user?.id || user?.email || "anon";
  const storageKeyCurrentStep = `customerPortal_${storageId}_currentStep`;
  const storageKeyFormData = `customerPortal_${storageId}_formData`;
  const storageKeyFiles = `customerPortal_${storageId}_files`;
  const storageKeySuccessData = `customerPortal_${storageId}_successData`;

  const [currentStep, setCurrentStep] = useState(() => {
    try {
      const saved = localStorage.getItem(storageKeyCurrentStep);
      return saved ? parseInt(saved, 10) : 0;
    } catch {
      return 0;
    }
  });

  const [formData, setFormData] = useState(() => {
    try {
      const saved = localStorage.getItem(storageKeyFormData);
      return saved ? JSON.parse(saved) : initialFormData;
    } catch {
      return initialFormData;
    }
  });

  const [files, setFiles] = useState(() => {
    try {
      const saved = localStorage.getItem(storageKeyFiles);
      return saved ? JSON.parse(saved) : initialFiles;
    } catch {
      return initialFiles;
    }
  });

  const [errors, setErrors] = useState({});
  const [selectedDocType, setSelectedDocType] = useState(documentOptions[0].id);
  const [stagedFile, setStagedFile] = useState(null);
  const [docDropdownOpen, setDocDropdownOpen] = useState(false);
  const [docSearch, setDocSearch] = useState("");
  const [docHighlight, setDocHighlight] = useState(0);
  const [logoutLoading, setLogoutLoading] = useState(false);

  const [vehicles, setVehicles] = useState([]);
  const [vehicleDropdownOpen, setVehicleDropdownOpen] = useState(false);
  const [vehicleSearch, setVehicleSearch] = useState("");
  const [loadingVehicles, setLoadingVehicles] = useState(false);
  const [selectedVehicle, setSelectedVehicle] = useState(null);
  const [loadingVehicleData] = useState(false);

  const [poNumbers, setPoNumbers] = useState([]);
  const [poDropdownOpen, setPoDropdownOpen] = useState(false);
  const [poSearch, setPoSearch] = useState(() => {
    try {
      const saved = localStorage.getItem(storageKeyFormData);
      if (saved) {
        const parsed = JSON.parse(saved);
        return String(parsed.poNumber || "");
      }
    } catch {
      // ignore
    }
    return "";
  });
  const [selectedPoNumber, setSelectedPoNumber] = useState(null);
  const [loadingPos, setLoadingPos] = useState(false);
  const [driverExists, setDriverExists] = useState(false);
  const [helperExists, setHelperExists] = useState(false);
  const [hasShownDriverHelperPopup, setHasShownDriverHelperPopup] =
    useState(false);

  const [myVehicles, setMyVehicles] = useState([]);
  const [vehicleHighlight, setVehicleHighlight] = useState(0);
  const [vehicleSaved, setVehicleSaved] = useState(false);
  const [autoFillData] = useState(null);
  const [savedDriverHelperData, setSavedDriverHelperData] = useState(null);

  const [savedDriverData, setSavedDriverData] = useState(null);
  const [savedHelperData, setSavedHelperData] = useState(null);
  const [driverChanged, setDriverChanged] = useState(false);
  const [helperChanged, setHelperChanged] = useState(false);
  const [savingDriver, setSavingDriver] = useState(false);
  const [savingHelper, setSavingHelper] = useState(false);

  const docButtonRef = useRef(null);
  const docListRef = useRef(null);
  const vehicleButtonRef = useRef(null);
  const vehicleInputRef = useRef(null);
  const vehicleListRef = useRef(null);
  const poInputRef = useRef(null);
  const poListRef = useRef(null);
  const lastStorageIdRef = useRef(storageId);
  const lastStep1NextRef = useRef({ vehicleNumber: null, poNumber: null });
  const lastStep2NextRef = useRef({ snapshot: null });

  const normalizeAadharValue = (value) =>
    String(value ?? "")
      .replace(/\D/g, "")
      .slice(0, 12);

  useEffect(() => {
    let isMounted = true;

    const fetchMyVehicles = async () => {
      if (!user || !user.email) return;

      try {
        setLoadingVehicles(true);
        const response = await vehiclesAPI.getMyVehicles();
        if (isMounted) {
          setMyVehicles(response.data.vehicles || []);
          setVehicles(response.data.vehicles || []);
          setErrors((prev) => ({ ...prev, vehiclesFetch: null }));
        }
      } catch (error) {
        console.error("Failed to fetch vehicles:", error);
        if (isMounted) {
          if (error.response?.status === 401) {
            console.warn(
              "Got 401 when fetching vehicles - token may be invalid"
            );
            setVehicles([]);
          } else {
            setErrors((prev) => ({
              ...prev,
              vehiclesFetch:
                "Could not load your vehicles. You can still enter them manually.",
            }));
          }
        }
      } finally {
        if (isMounted) {
          setLoadingVehicles(false);
        }
      }
    };

    fetchMyVehicles();

    return () => {
      isMounted = false;
    };
  }, [user?.id]);

  useEffect(() => {
    if (currentStep !== 0) return;

    const nextValue = String(formData.vehicleNumber || "");
    if (!nextValue) return;

    const isEditing =
      vehicleInputRef.current && document.activeElement === vehicleInputRef.current;
    if (isEditing || vehicleDropdownOpen) return;

    if (vehicleSearch !== nextValue) {
      setVehicleSearch(nextValue);
    }

    if (!selectedVehicle) {
      const match = (myVehicles || []).find(
        (v) => String(v?.vehicleRegistrationNo || "") === nextValue
      );
      if (match) {
        setSelectedVehicle(match);
      }
    }
  }, [currentStep, formData.vehicleNumber, vehicleDropdownOpen, myVehicles, selectedVehicle, vehicleSearch]);

  useEffect(() => {
    if (lastStorageIdRef.current === storageId) return;
    lastStorageIdRef.current = storageId;

    const customerEmail = user?.email || "";
    const customerPhone = user?.phone || user?.telephone || "";

    let nextForm = null;
    let nextFiles = null;
    let nextStep = 0;
    try {
      const saved = localStorage.getItem(storageKeyFormData);
      if (saved) {
        nextForm = JSON.parse(saved);
      }
    } catch {
      nextForm = null;
    }

    try {
      const saved = localStorage.getItem(storageKeyFiles);
      if (saved) {
        nextFiles = JSON.parse(saved);
      }
    } catch {
      nextFiles = null;
    }

    try {
      const saved = localStorage.getItem(storageKeyCurrentStep);
      if (saved) {
        nextStep = parseInt(saved, 10);
      }
    } catch {
      nextStep = 0;
    }

    if (nextForm) {
      setFormData(nextForm);
      setPoSearch(String(nextForm.poNumber || ""));
    } else {
      setFormData({
        ...initialFormData,
        customerEmail,
        customerPhone,
      });
      setPoSearch("");
      setVehicleSearch("");
      setSelectedVehicle(null);
      setSavedDriverData(null);
      setSavedHelperData(null);
      setAllDrivers([]);
      setAllHelpers([]);
      setDriverSearch("");
      setHelperSearch("");
      setDriverExists(false);
      setHelperExists(false);
      setDriverChanged(false);
      setHelperChanged(false);
      setSavedDriverHelperData(null);
    }

    setFiles(nextFiles || initialFiles);
    setCurrentStep(Number.isFinite(nextStep) ? nextStep : 0);

    localStorage.removeItem("customerPortal_formData");
    localStorage.removeItem("customerPortal_files");
    localStorage.removeItem("customerPortal_currentStep");
  }, [storageId, storageKeyCurrentStep, storageKeyFiles, storageKeyFormData, user?.email, user?.phone, user?.telephone]);

  useEffect(() => {
    let isMounted = true;

    const fetchMyPOs = async () => {
      if (!user || !user.email) return;

      try {
        setLoadingPos(true);
        const response = await poDetailsAPI.getMyPOs();
        if (isMounted) {
          const poList = response.data.pos || [];
          setPoNumbers(poList);
          setErrors((prev) => ({ ...prev, poFetch: null }));
        }
      } catch (error) {
        console.error("Failed to fetch PO numbers:", error);
        if (isMounted) {
          if (error.response?.status === 401) {
            console.warn(
              "Got 401 when fetching PO numbers - token may be invalid"
            );
            setPoNumbers([]);
          } else {
            setErrors((prev) => ({
              ...prev,
              poFetch:
                "Could not load your PO numbers. You can still enter them manually.",
            }));
          }
        }
      } finally {
        if (isMounted) {
          setLoadingPos(false);
        }
      }
    };

    fetchMyPOs();

    return () => {
      isMounted = false;
    };
  }, [user?.id]);

  useEffect(() => {
    console.log("=== PO Debug ===");
    console.log("poSearch type:", typeof poSearch);
    console.log("poSearch value:", poSearch);
    console.log("formData.poNumber:", formData.poNumber);
    console.log("poNumbers:", poNumbers);
  }, [poSearch, formData.poNumber, poNumbers]);

  useEffect(() => {
    const poNumber = String(formData.poNumber || "");
    const currentSearch = String(poSearch || "");

    if (poNumber && poNumber !== currentSearch) {
      setPoSearch(poNumber);
    }
  }, [formData.poNumber]);

  useEffect(() => {
    if (user && user.email && user.phone) {
      setFormData((prev) => ({
        ...prev,
        customerEmail: user.email,
        customerPhone: user.phone,
      }));
    } else if (!user) {
      setFormData(initialFormData);
      setFiles(initialFiles);
      setErrors({});
      setCurrentStep(0);
      setSubmitError("");
      setSuccessData(null);
      setVehicles([]);
      setSelectedVehicle(null);
    }
  }, [user?.id]);

  useEffect(() => {
    try {
      localStorage.setItem(storageKeyFormData, JSON.stringify(formData));
    } catch (error) {
      console.error("Failed to save form data to localStorage:", error);
    }
  }, [formData, storageKeyFormData]);

  useEffect(() => {
    try {
      localStorage.setItem(storageKeyFiles, JSON.stringify(files));
    } catch (error) {
      console.error("Failed to save files to localStorage:", error);
    }
  }, [files, storageKeyFiles]);

  useEffect(() => {
    try {
      localStorage.setItem(storageKeyCurrentStep, currentStep.toString());
    } catch (error) {
      console.error("Failed to save current step to localStorage:", error);
    }
  }, [currentStep, storageKeyCurrentStep]);

  useEffect(() => {
    const onDocClickAway = (e) => {
      if (!docButtonRef.current) return;
      if (docButtonRef.current.contains(e.target)) return;
      if (
        docListRef.current &&
        docListRef.current.contains &&
        docListRef.current.contains(e.target)
      )
        return;
      setDocDropdownOpen(false);
    };
    if (docDropdownOpen) {
      document.addEventListener("click", onDocClickAway);
    }
    return () => document.removeEventListener("click", onDocClickAway);
  }, [docDropdownOpen]);

  const [prefDropdownOpen, setPrefDropdownOpen] = useState(false);
  const [prefSearch, setPrefSearch] = useState("");
  const [prefHighlight, setPrefHighlight] = useState(0);
  const prefButtonRef = useRef(null);
  const prefListRef = useRef(null);

  const [helperPrefDropdownOpen, setHelperPrefDropdownOpen] = useState(false);
  const [helperPrefSearch, setHelperPrefSearch] = useState("");
  const [helperPrefHighlight, setHelperPrefHighlight] = useState(0);
  const helperPrefButtonRef = useRef(null);
  const helperPrefListRef = useRef(null);

  const [showDriverModal, setShowDriverModal] = useState(false);
  const [showHelperModal, setShowHelperModal] = useState(false);

  const [allDrivers, setAllDrivers] = useState([]);
  const [allHelpers, setAllHelpers] = useState([]);
  const [driverDropdownOpen, setDriverDropdownOpen] = useState(false);
  const [helperDropdownOpen, setHelperDropdownOpen] = useState(false);
  const [driverSearch, setDriverSearch] = useState("");
  const [helperSearch, setHelperSearch] = useState("");
  const driverInputRef = useRef(null);
  const helperInputRef = useRef(null);
  const driverListRef2 = useRef(null);
  const helperListRef2 = useRef(null);

  useEffect(() => {
    const onPrefClickAway = (e) => {
      if (!prefButtonRef.current) return;
      if (prefButtonRef.current.contains(e.target)) return;
      if (
        prefListRef.current &&
        prefListRef.current.contains &&
        prefListRef.current.contains(e.target)
      )
        return;
      setPrefDropdownOpen(false);
    };
    if (prefDropdownOpen) {
      document.addEventListener("click", onPrefClickAway);
    }
    return () => document.removeEventListener("click", onPrefClickAway);
  }, [prefDropdownOpen]);

  useEffect(() => {
    const onDriverClickAway = (e) => {
      if (driverInputRef.current && driverInputRef.current.contains(e.target)) {
        return;
      }
      if (driverListRef2.current && driverListRef2.current.contains(e.target))
        return;
      setDriverDropdownOpen(false);
    };
    if (driverDropdownOpen) {
      document.addEventListener("click", onDriverClickAway);
    }
    return () => document.removeEventListener("click", onDriverClickAway);
  }, [driverDropdownOpen]);

  useEffect(() => {
    const onHelperClickAway = (e) => {
      if (helperInputRef.current && helperInputRef.current.contains(e.target)) {
        return;
      }
      if (helperListRef2.current && helperListRef2.current.contains(e.target))
        return;
      setHelperDropdownOpen(false);
    };
    if (helperDropdownOpen) {
      document.addEventListener("click", onHelperClickAway);
    }
    return () => document.removeEventListener("click", onHelperClickAway);
  }, [helperDropdownOpen]);

  useEffect(() => {
    const onHelperPrefClickAway = (e) => {
      if (!helperPrefButtonRef.current) return;
      if (helperPrefButtonRef.current.contains(e.target)) return;
      if (
        helperPrefListRef.current &&
        helperPrefListRef.current.contains &&
        helperPrefListRef.current.contains(e.target)
      )
        return;
      setHelperPrefDropdownOpen(false);
    };
    if (helperPrefDropdownOpen) {
      document.addEventListener("click", onHelperPrefClickAway);
    }
    return () => document.removeEventListener("click", onHelperPrefClickAway);
  }, [helperPrefDropdownOpen]);

  useEffect(() => {
    const onVehicleClickAway = (e) => {
      if (
        vehicleInputRef.current &&
        vehicleInputRef.current.contains(e.target)
      ) {
        return;
      }
      if (
        vehicleListRef.current &&
        vehicleListRef.current.contains &&
        vehicleListRef.current.contains(e.target)
      )
        return;
      setVehicleDropdownOpen(false);
    };
    if (vehicleDropdownOpen) {
      document.addEventListener("click", onVehicleClickAway);
    }
    return () => document.removeEventListener("click", onVehicleClickAway);
  }, [vehicleDropdownOpen]);

  useEffect(() => {
    const onPoClickAway = (e) => {
      if (poInputRef.current && poInputRef.current.contains(e.target)) {
        return;
      }
      if (
        poListRef.current &&
        poListRef.current.contains &&
        poListRef.current.contains(e.target)
      )
        return;
      setPoDropdownOpen(false);
    };
    if (poDropdownOpen) {
      document.addEventListener("click", onPoClickAway);
    }
    return () => document.removeEventListener("click", onPoClickAway);
  }, [poDropdownOpen]);

  useEffect(() => {
    if (savedDriverHelperData) {
      const currentData = {
        driverName: (formData.driverName || "").trim(),
        driverPhone: formData.driverPhone || "",
        driverLanguage: formData.driverLanguage || "en",
        driverAadhar: (formData.driverAadhar || "").trim(),
        helperName: (formData.helperName || "").trim(),
        helperPhone: formData.helperPhone || "",
        helperLanguage: formData.helperLanguage || "en",
        helperAadhar: (formData.helperAadhar || "").trim(),
      };

      if (!compareDriverHelperData(currentData, savedDriverHelperData)) {
        setSavedDriverHelperData(null);
      }
    }
  }, [
    formData.driverName,
    formData.driverPhone,
    formData.driverLanguage,
    formData.driverAadhar,
    formData.helperName,
    formData.helperPhone,
    formData.helperLanguage,
    formData.helperAadhar,
    savedDriverHelperData,
  ]);

  useEffect(() => {
    if (savedDriverData) {
      const hasChanged =
        formData.driverName !== savedDriverData.name ||
        formData.driverPhone !== savedDriverData.phoneNo ||
        formData.driverLanguage !== savedDriverData.language ||
        normalizeAadharValue(formData.driverAadhar) !==
          normalizeAadharValue(savedDriverData.uid);
      setDriverChanged(hasChanged);
    }
  }, [
    formData.driverName,
    formData.driverPhone,
    formData.driverLanguage,
    formData.driverAadhar,
    savedDriverData,
  ]);

  useEffect(() => {
    if (savedHelperData) {
      const hasChanged =
        formData.helperName !== savedHelperData.name ||
        formData.helperPhone !== savedHelperData.phoneNo ||
        formData.helperLanguage !== savedHelperData.language ||
        normalizeAadharValue(formData.helperAadhar) !==
          normalizeAadharValue(savedHelperData.uid);
      setHelperChanged(hasChanged);
    }
  }, [
    formData.helperName,
    formData.helperPhone,
    formData.helperLanguage,
    formData.helperAadhar,
    savedHelperData,
  ]);

  const [submitError, setSubmitError] = useState("");
  const [loading, setLoading] = useState(false);
  const [successData, setSuccessData] = useState(() => {
    try {
      const saved = localStorage.getItem(storageKeySuccessData);
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  useEffect(() => {
    try {
      if (successData) {
        localStorage.setItem(storageKeySuccessData, JSON.stringify(successData));
      } else {
        localStorage.removeItem(storageKeySuccessData);
      }
    } catch (error) {
      console.error("Failed to save success data to localStorage:", error);
    }
  }, [successData, storageKeySuccessData]);

  const [mockNotice, setMockNotice] = useState("");
  const [showNotify, setShowNotify] = useState(false);
  const [showPopup, setShowPopup] = useState(false);
  const [popupMessage, setPopupMessage] = useState("");
  const [popupVariant, setPopupVariant] = useState("info");
  const [dapName, setDapName] = useState("");
  const [loadingDap, setLoadingDap] = useState(false);

  const stepFieldMap = useMemo(
    () => ({
      0: ["customerEmail", "customerPhone", "vehicleNumber", "poNumber"],
      1: [
        "driverPhone",
        "helperPhone",
        "driverLanguage",
        "helperName",
        "driverName",
        "helperLanguage",
        "driverAadhar",
        "helperAadhar",
      ],
      2: ["_anyDocument"],
    }),
    []
  );

  const formatVehicleNumber = (value) =>
    value
      .toUpperCase()
      .replace(/[^A-Z0-9-\s↑△▲]/g, "")
      .slice(0, 20);

  const formatPhoneValue = (value) => {
    const digits = value.replace(/\D/g, "");
    if (!digits) {
      return "";
    }
    const withoutCountry = digits.startsWith("91") ? digits.slice(2) : digits;
    const trimmed = withoutCountry.slice(0, 10);
    return trimmed ? `+91${trimmed}` : "";
  };

  const clearFieldError = useCallback((field) => {
    setErrors((previous) => {
      if (!previous[field]) {
        return previous;
      }
      const updated = { ...previous };
      delete updated[field];
      return updated;
    });
  }, []);

  const handleLogout = useCallback(async () => {
    setLogoutLoading(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 500));
      logout();
    } finally {
      setLogoutLoading(false);
    }
  }, [logout]);

  const handleInputChange = (field, value) => {
    let nextValue = value;
    if (field === "vehicleNumber") {
      nextValue = formatVehicleNumber(value);
      setVehicleSaved(false);
    }
    if (
      field === "driverPhone" ||
      field === "helperPhone" ||
      field === "customerPhone"
    ) {
      nextValue = formatPhoneValue(value);
    }
    if (field === "poNumber") {
      nextValue = value
        .toUpperCase()
        .replace(/[^A-Z0-9-\s]/g, "")
        .slice(0, 50);
    }
    if (field === "driverAadhar" || field === "helperAadhar") {
      nextValue = normalizeAadharValue(value);
    }
    setFormData((previous) => ({
      ...previous,
      [field]: nextValue,
    }));
    clearFieldError(field);
  };

  const handleFileSelect = (field, file) => {
    let errorMessage = "";
    if (!ACCEPTED_TYPES.includes(file.type)) {
      errorMessage = "Only PDF, JPG, JPEG, or PNG files are accepted.";
    } else if (file.size > MAX_FILE_SIZE) {
      errorMessage = "File must be 5MB or smaller.";
    }
    if (errorMessage) {
      setErrors((previous) => ({
        ...previous,
        [field]: errorMessage,
      }));
      return;
    }
    setFiles((previous) => {
      const existing = previous[field];
      const arr = Array.isArray(existing)
        ? existing
        : existing
        ? [existing]
        : [];
      return {
        ...previous,
        [field]: [...arr, file],
      };
    });
    clearFieldError(field);
  };

  const handleStageFile = (file) => {
    let errorMessage = "";
    if (!ACCEPTED_TYPES.includes(file.type)) {
      errorMessage = "Only PDF, JPG, JPEG, or PNG files are accepted.";
    } else if (file.size > MAX_FILE_SIZE) {
      errorMessage = "File must be 5MB or smaller.";
    }
    if (errorMessage) {
      setErrors((previous) => ({ ...previous, staged: errorMessage }));
      return;
    }
    setStagedFile(file);
    setErrors((previous) => {
      const copy = { ...previous };
      delete copy.staged;
      return copy;
    });
  };

  const handleUploadStaged = async () => {
    if (!stagedFile) {
      setErrors((previous) => ({
        ...previous,
        staged: "No file selected to upload.",
      }));
      return;
    }

    setLoading(true);

    try {
      const uploadFormData = new FormData();
      uploadFormData.append("file", stagedFile);
      uploadFormData.append("document_type", selectedDocType);

      if (formData.vehicleNumber) {
        uploadFormData.append("vehicle_number", formData.vehicleNumber.trim());
      }
      if (formData.poNumber) {
        uploadFormData.append("po_number", formData.poNumber.trim());
      }
      if (formData.driverPhone) {
        uploadFormData.append("driver_phone", formData.driverPhone);
      }
      if (formData.helperPhone) {
        uploadFormData.append("helper_phone", formData.helperPhone);
      }

      const response = await documentsAPI.uploadToDocumentControl(
        uploadFormData
      );

      if (response.data && response.data.document) {
        console.log("Document uploaded successfully:", response.data);

        setFiles((previous) => {
          const existing = previous[selectedDocType];
          const arr = Array.isArray(existing)
            ? existing
            : existing
            ? [existing]
            : [];

          const fileWithInfo = {
            ...stagedFile,
            documentId: response.data.document.id,
            filePath: response.data.document.filePath,
            name: stagedFile.name,
            fromDatabase: true,
          };

          return {
            ...previous,
            [selectedDocType]: [...arr, fileWithInfo],
          };
        });

        setStagedFile(null);
        clearFieldError(selectedDocType);

        showPopupMessage(
          `${
            documentOptions.find((d) => d.id === selectedDocType)?.label
          } uploaded successfully`,
          "info"
        );
      }
    } catch (error) {
      console.error("Upload error:", error);

      let errorMessage = "Failed to upload document. Please try again.";

      if (error.response) {
        const status = error.response.status;
        const data = error.response.data;

        if (status === 400) {
          errorMessage =
            data?.error || "Invalid file or missing reference information.";
        } else if (status === 401) {
          errorMessage = "Authentication failed. Please sign in again.";
        } else if (status === 413) {
          errorMessage = "File is too large. Maximum size is 5MB.";
        } else if (data?.error) {
          errorMessage = data.error;
        }
      } else if (error.request) {
        errorMessage = "Network error. Please check your connection.";
      }

      setErrors((previous) => ({
        ...previous,
        staged: errorMessage,
      }));

      showPopupMessage(errorMessage, "warning");
    } finally {
      setLoading(false);
    }
  };

  const handleClearUploaded = async (field, index = null) => {
    const fileToDelete = Array.isArray(files[field])
      ? files[field][index]
      : files[field];

    if (fileToDelete?.documentId && fileToDelete?.fromDatabase) {
      const confirmDelete = window.confirm(
        "This document is stored in the database. Do you want to delete it permanently?"
      );

      if (!confirmDelete) {
        return;
      }

      try {
        setLoading(true);

        const response = await documentsAPI.deleteFromDocumentControl(
          fileToDelete.documentId
        );

        console.log("Document deleted from database:", response.data);

        showPopupMessage(
          response.data.message || "Document deleted successfully",
          "info"
        );
      } catch (error) {
        console.error("Failed to delete document:", error);

        const errorMessage =
          error.response?.data?.error || "Failed to delete document";

        showPopupMessage(errorMessage, "warning");
      } finally {
        setLoading(false);
      }
    }

    setFiles((previous) => {
      const fileArray = Array.isArray(previous[field]) ? previous[field] : [];

      if (index !== null && typeof index === "number") {
        return {
          ...previous,
          [field]: fileArray.filter((_, i) => i !== index),
        };
      }

      return {
        ...previous,
        [field]: fileArray.length > 0 ? fileArray.slice(1) : [],
      };
    });

    clearFieldError(field);
  };

  const validateFields = useCallback(
    (fieldNames, dataToValidate = null) => {
      const validationErrors = {};
      const dataSource = dataToValidate || formData;

      fieldNames.forEach((field) => {
        if (field === "customerEmail") {
          const result = validateEmail(dataSource.customerEmail);
          if (result) {
            validationErrors.customerEmail = result;
          }
        }
        if (field === "customerPhone") {
          const result = validatePhone(dataSource.customerPhone, "Phone number");
          if (result) {
            validationErrors.customerPhone = result;
          }
        }
        if (field === "vehicleNumber") {
          const result = validateVehicleNumber(dataSource.vehicleNumber);
          if (result) {
            validationErrors.vehicleNumber = result;
          }
        }
        if (field === "poNumber") {
          const result = validatePoNumber(dataSource.poNumber);
          if (result) {
            validationErrors.poNumber = result;
          }
        }
        if (field === "driverPhone") {
          const result = validatePhone(
            dataSource.driverPhone,
            "Driver phone number"
          );
          if (result) {
            validationErrors.driverPhone = result;
          }
        }
        if (field === "driverName") {
          if (!dataSource.driverName || !dataSource.driverName.trim()) {
            validationErrors.driverName = "Driver name is required.";
          } else if (dataSource.driverName.trim().length < 2) {
            validationErrors.driverName =
              "Driver name must be at least 2 characters.";
          }
        }
        if (field === "driverAadhar") {
          if (!(driverExists && !driverChanged)) {
            const normalizedDriverAadhar = normalizeAadharValue(
              dataSource.driverAadhar
            );
            if (!normalizedDriverAadhar) {
              validationErrors.driverAadhar =
                "Driver Aadhar number is required.";
            } else if (normalizedDriverAadhar.length !== 12) {
              validationErrors.driverAadhar =
                "Driver Aadhar must be exactly 12 digits.";
            }
          }
        }
        if (field === "helperPhone") {
          const result = validateHelperPhone(dataSource.helperPhone);
          if (result) {
            validationErrors.helperPhone = result;
          }
        }
        if (field === "helperName") {
          if (!dataSource.helperName || !dataSource.helperName.trim()) {
            validationErrors.helperName = "Helper name is required.";
          } else if (dataSource.helperName.trim().length < 2) {
            validationErrors.helperName =
              "Helper name must be at least 2 characters.";
          }
        }
        if (field === "helperAadhar") {
          if (!(helperExists && !helperChanged)) {
            const normalizedHelperAadhar = normalizeAadharValue(
              dataSource.helperAadhar
            );
            if (!normalizedHelperAadhar) {
              validationErrors.helperAadhar =
                "Helper Aadhar number is required.";
            } else if (normalizedHelperAadhar.length !== 12) {
              validationErrors.helperAadhar =
                "Helper Aadhar must be exactly 12 digits.";
            }
          }
        }
        if (field === "driverLanguage" && !dataSource.driverLanguage) {
          validationErrors.driverLanguage = "Driver language is required.";
        }
        if (field === "helperLanguage" && !dataSource.helperLanguage) {
          validationErrors.helperLanguage = "Helper language is required.";
        }
        if (field === "purchaseOrder") {
          const first = (files.purchaseOrder && files.purchaseOrder[0]) || null;
          const result = validateFile(first, "Purchase Order");
          if (result) {
            validationErrors.purchaseOrder = result;
          }
        }
        if (field === "vehiclePapers") {
          const first = (files.vehiclePapers && files.vehiclePapers[0]) || null;
          const result = validateFile(first, "Vehicle Papers");
          if (result) {
            validationErrors.vehiclePapers = result;
          }
        }
        if (field === "aadhaarCard") {
          const first = (files.aadhaarCard && files.aadhaarCard[0]) || null;
          const result = validateFile(first, "Driver Aadhaar Card");
          if (result) {
            validationErrors.aadhaarCard = result;
          }
        }
        if (field === "_anyDocument") {
          const anyUploaded = Object.values(files).some((arr) =>
            Array.isArray(arr) ? arr.length > 0 : !!arr
          );
          if (!anyUploaded) {
            validationErrors.documents =
              "At least one document upload is required.";
          }
        }
      });

      if (Object.keys(validationErrors).length > 0) {
        setErrors((prev) => ({ ...prev, ...validationErrors }));
        return false;
      }

      return true;
    },
    [formData, files, driverExists, driverChanged, helperExists, helperChanged]
  );

  const handleSaveDriver = async () => {
    const normalizedDriverAadhar = normalizeAadharValue(formData.driverAadhar);
    if (!normalizedDriverAadhar || normalizedDriverAadhar.length !== 12) {
      showPopupMessage("Driver Aadhar must be exactly 12 digits", "warning");
      return;
    }

    const localDriver = {
      id: savedDriverData?.id || `temp-driver-${Date.now()}`,
      uid: normalizedDriverAadhar,
      name: (formData.driverName || "").trim(),
      phoneNo: formData.driverPhone,
      type: "Driver",
      language: formData.driverLanguage,
    };

    setSavedDriverData(localDriver);
    setDriverSearch(localDriver.name || "");
    setDriverDropdownOpen(false);
    setDriverExists(true);
    setDriverChanged(false);

    setAllDrivers((prev) => {
      const exists = prev.some((d) => d.phoneNo === localDriver.phoneNo);
      if (exists) return prev;
      return [localDriver, ...prev];
    });
  };

  const handleSaveHelper = async () => {
    const normalizedHelperAadhar = normalizeAadharValue(formData.helperAadhar);
    if (!normalizedHelperAadhar || normalizedHelperAadhar.length !== 12) {
      showPopupMessage("Helper Aadhar must be exactly 12 digits", "warning");
      return;
    }

    const localHelper = {
      id: savedHelperData?.id || `temp-helper-${Date.now()}`,
      uid: normalizedHelperAadhar,
      name: (formData.helperName || "").trim(),
      phoneNo: formData.helperPhone,
      type: "Helper",
      language: formData.helperLanguage,
    };

    setSavedHelperData(localHelper);
    setHelperSearch(localHelper.name || "");
    setHelperDropdownOpen(false);
    setHelperExists(true);
    setHelperChanged(false);

    setAllHelpers((prev) => {
      const exists = prev.some((h) => h.phoneNo === localHelper.phoneNo);
      if (exists) return prev;
      return [localHelper, ...prev];
    });
  };

  const handleAddDriver = async () => {
    const errors = {};
    const normalizedDriverAadhar = normalizeAadharValue(formData.driverAadhar);
    if (!(formData.driverName || "").trim()) {
      errors.driverName = "Driver name is required";
    }
    if (!formData.driverPhone) {
      errors.driverPhone = "Driver phone is required";
    }
    if (!normalizedDriverAadhar) {
      errors.driverAadhar = "Driver Aadhar is required";
    } else if (normalizedDriverAadhar.length !== 12) {
      errors.driverAadhar = "Driver Aadhar must be exactly 12 digits";
    }

    if (Object.keys(errors).length > 0) {
      setErrors((prev) => ({ ...prev, ...errors }));
      showPopupMessage("Please fill all driver fields", "warning");
      return;
    }

    const localDriver = {
      id: savedDriverData?.id || `temp-driver-${Date.now()}`,
      uid: normalizedDriverAadhar,
      name: (formData.driverName || "").trim(),
      phoneNo: formData.driverPhone,
      type: "Driver",
      language: formData.driverLanguage,
    };

    setSavedDriverData(localDriver);
    setDriverSearch(localDriver.name || "");
    setDriverDropdownOpen(false);
    setDriverExists(true);
    setDriverChanged(false);

    setAllDrivers((prev) => {
      const exists = prev.some((d) => d.phoneNo === localDriver.phoneNo);
      if (exists) return prev;
      return [localDriver, ...prev];
    });
  };

  const handleAddHelper = async () => {
    const errors = {};
    const normalizedHelperAadhar = normalizeAadharValue(formData.helperAadhar);
    if (!(formData.helperName || "").trim()) {
      errors.helperName = "Helper name is required";
    }
    if (!formData.helperPhone) {
      errors.helperPhone = "Helper phone is required";
    }
    if (!normalizedHelperAadhar) {
      errors.helperAadhar = "Helper Aadhar is required";
    } else if (normalizedHelperAadhar.length !== 12) {
      errors.helperAadhar = "Helper Aadhar must be exactly 12 digits";
    }

    if (Object.keys(errors).length > 0) {
      setErrors((prev) => ({ ...prev, ...errors }));
      showPopupMessage("Please fill all helper fields", "warning");
      return;
    }

    const localHelper = {
      id: savedHelperData?.id || `temp-helper-${Date.now()}`,
      uid: normalizedHelperAadhar,
      name: (formData.helperName || "").trim(),
      phoneNo: formData.helperPhone,
      type: "Helper",
      language: formData.helperLanguage,
    };

    setSavedHelperData(localHelper);
    setHelperSearch(localHelper.name || "");
    setHelperDropdownOpen(false);
    setHelperExists(true);
    setHelperChanged(false);

    setAllHelpers((prev) => {
      const exists = prev.some((h) => h.phoneNo === localHelper.phoneNo);
      if (exists) return prev;
      return [localHelper, ...prev];
    });
  };

  const handleDriverModalSave = async (driverData) => {
    const requestedUid = normalizeAadharValue(driverData.aadhar);
    const localDriver = {
      id: `temp-driver-${Date.now()}`,
      uid: requestedUid,
      name: (driverData.name || "").trim(),
      phoneNo: driverData.phone,
      type: "Driver",
      language: driverData.language,
    };

    setFormData((prev) => ({
      ...prev,
      driverName: localDriver.name,
      driverPhone: localDriver.phoneNo,
      driverLanguage: localDriver.language,
      driverAadhar: requestedUid,
    }));

    setAllDrivers((prev) => [localDriver, ...prev]);
    setSavedDriverData(localDriver);
    setDriverExists(true);
    setDriverSearch(localDriver.name || "");
    setDriverDropdownOpen(false);

    setShowDriverModal(false);
  };

  const handleHelperModalSave = async (helperData) => {
    const requestedUid = normalizeAadharValue(helperData.aadhar);
    const localHelper = {
      id: `temp-helper-${Date.now()}`,
      uid: requestedUid,
      name: (helperData.name || "").trim(),
      phoneNo: helperData.phone,
      type: "Helper",
      language: helperData.language,
    };

    setFormData((prev) => ({
      ...prev,
      helperName: localHelper.name,
      helperPhone: localHelper.phoneNo,
      helperLanguage: localHelper.language,
      helperAadhar: requestedUid,
    }));

    setAllHelpers((prev) => [localHelper, ...prev]);
    setSavedHelperData(localHelper);
    setHelperExists(true);
    setHelperSearch(localHelper.name || "");
    setHelperDropdownOpen(false);

    setShowHelperModal(false);
  };

  const handleDriverSelect = async (driver) => {
  console.log(`🔄 Driver selected: ${driver.name} (ID: ${driver.id})`);
  
  // Update form data with selected driver
  setFormData((prev) => ({
    ...prev,
    driverName: driver.name,
    driverPhone: driver.phoneNo,
    driverLanguage: driver.language,
    driverAadhar: normalizeAadharValue(driver.uid),
  }));
  
  setDriverSearch(driver.name);
  setDriverDropdownOpen(false);
  setSavedDriverData(driver);
  setDriverExists(true);
  setDriverChanged(false); // Reset changed flag since we're loading saved data
};

  const handleHelperSelect = async (helper) => {
  console.log(`🔄 Helper selected: ${helper.name} (ID: ${helper.id})`);
  
  // Update form data with selected helper
  setFormData((prev) => ({
    ...prev,
    helperName: helper.name,
    helperPhone: helper.phoneNo,
    helperLanguage: helper.language,
    helperAadhar: normalizeAadharValue(helper.uid),
  }));
  
  setHelperSearch(helper.name);
  setHelperDropdownOpen(false);
  setSavedHelperData(helper);
  setHelperExists(true);
  setHelperChanged(false); // Reset changed flag since we're loading saved data
};

  const handleNextStep = async () => {
    const currentStepFields = stepFieldMap[currentStep];
    let updatedFormData = { ...formData };

    if (currentStep === 0) {
      const poValue = String(poSearch || formData.poNumber || "").trim();
      if (poValue && poValue !== formData.poNumber) {
        updatedFormData.poNumber = poValue;
        setFormData(updatedFormData);
      }
    }

    if (currentStep === 1) {
      const hasDriverDetails =
        !!savedDriverData ||
        !!((updatedFormData.driverName || "").trim() && updatedFormData.driverPhone);
      const hasHelperDetails =
        !!savedHelperData ||
        !!((updatedFormData.helperName || "").trim() && updatedFormData.helperPhone);

      if (!hasDriverDetails || !hasHelperDetails) {
        showPopupMessage("Add Driver and Helper Details first", "warning");
        return;
      }
    }

    if (!validateFields(currentStepFields, updatedFormData)) {
      const hasEmptyFields = currentStepFields.some((field) => {
        if (field === "_anyDocument") {
          return !Object.values(files).some((arr) =>
            Array.isArray(arr) ? arr.length > 0 : !!arr
          );
        }

        if (
          field === "customerEmail" ||
          field === "vehicleNumber" ||
          field === "poNumber" ||
          field === "driverName" ||
          field === "driverPhone" ||
          field === "driverAadhar" ||
          field === "helperName" ||
          field === "helperPhone" ||
          field === "helperAadhar"
        ) {
          return (
            !updatedFormData[field] ||
            (typeof updatedFormData[field] === "string" && !updatedFormData[field].trim())
          );
        }

        return false;
      });

      if (hasEmptyFields) {
        showPopupMessage(
          "Please fill in all required fields before proceeding.",
          "warning"
        );
      }

      return;
    }

    if (currentStep === 0) {
      const normalizedVehicleNumber = String(
        updatedFormData.vehicleNumber || ""
      ).trim();
      const normalizedPoNumber = String(updatedFormData.poNumber || "").trim();

      const step1Unchanged =
        lastStep1NextRef.current.vehicleNumber === normalizedVehicleNumber &&
        lastStep1NextRef.current.poNumber === normalizedPoNumber;

      if (!step1Unchanged) {
        let vehicleCreated = false;
        let poCreated = false;
        const createdItems = [];

        try {
          setLoading(true);

          if (normalizedVehicleNumber) {
            const vehicleResponse = await vehiclesAPI.createOrGetVehicle(
              normalizedVehicleNumber
            );
            vehicleCreated = !!vehicleResponse.data?.created;

            if (vehicleCreated) {
              createdItems.push("Vehicle");
            }

            const { drivers = [], helpers = [] } = vehicleResponse.data || {};

            if (!vehicleCreated) {
              const updates = {};
              let hasDriver = false;
              let hasHelper = false;

              if (Array.isArray(drivers) && drivers.length > 0) {
                const driver = drivers[0];
                updates.driverName = driver.name || "";
                updates.driverPhone = driver.phoneNo || "";
                updates.driverLanguage = driver.language || "en";
                if (driver.uid) {
                  updates.driverAadhar = normalizeAadharValue(driver.uid);
                }
                setSavedDriverData(driver);
                setAllDrivers(drivers);
                setDriverSearch(driver.name || "");
                setDriverExists(!!driver.uid);
                setDriverChanged(false);
                hasDriver = true;
              }

              if (Array.isArray(helpers) && helpers.length > 0) {
                const helper = helpers[0];
                updates.helperName = helper.name || "";
                updates.helperPhone = helper.phoneNo || "";
                updates.helperLanguage = helper.language || "en";
                if (helper.uid) {
                  updates.helperAadhar = normalizeAadharValue(helper.uid);
                }
                setSavedHelperData(helper);
                setAllHelpers(helpers);
                setHelperSearch(helper.name || "");
                setHelperExists(!!helper.uid);
                setHelperChanged(false);
                hasHelper = true;
              }

              if (!hasDriver) {
                updates.driverName = "";
                updates.driverPhone = "";
                updates.driverLanguage = "en";
                updates.driverAadhar = "";
                setSavedDriverData(null);
                setAllDrivers([]);
                setDriverSearch("");
                setDriverExists(false);
                setDriverChanged(false);
              }

              if (!hasHelper) {
                updates.helperName = "";
                updates.helperPhone = "";
                updates.helperLanguage = "en";
                updates.helperAadhar = "";
                setSavedHelperData(null);
                setAllHelpers([]);
                setHelperSearch("");
                setHelperExists(false);
                setHelperChanged(false);
              }

              if (Object.keys(updates).length > 0) {
                setFormData((prev) => ({ ...prev, ...updates }));

                if (!hasShownDriverHelperPopup) {
                  if (hasDriver && hasHelper) {
                    showPopupMessage(
                      "Driver and Helper info auto-filled",
                      "info"
                    );
                  } else if (hasDriver) {
                    showPopupMessage("Driver info auto-filled", "info");
                  } else if (hasHelper) {
                    showPopupMessage("Helper info auto-filled", "info");
                  }
                  setHasShownDriverHelperPopup(true);
                }
              }
            } else {
              setFormData((prev) => ({
                ...prev,
                driverName: "",
                driverPhone: "",
                driverLanguage: "en",
                driverAadhar: "",
                helperName: "",
                helperPhone: "",
                helperLanguage: "en",
                helperAadhar: "",
              }));
              setSavedDriverData(null);
              setSavedHelperData(null);
              setAllDrivers([]);
              setAllHelpers([]);
              setDriverSearch("");
              setHelperSearch("");
              setDriverExists(false);
              setHelperExists(false);
              setDriverChanged(false);
              setHelperChanged(false);
              setSavedDriverHelperData(null);
              setHasShownDriverHelperPopup(false);
            }

            setVehicleSaved(true);

            const isDropdownSelectedExistingVehicle =
              !vehicleCreated &&
              !!selectedVehicle &&
              String(selectedVehicle?.vehicleRegistrationNo || "") ===
                normalizedVehicleNumber;

            if (isDropdownSelectedExistingVehicle) {
              const vehicleDocs = vehicleResponse.data?.documents || [];
              if (vehicleDocs.length > 0) {
                setFiles((prev) => {
                  const cleared = {
                    ...prev,
                    vehicleRegistration: (prev.vehicleRegistration || []).filter(
                      (f) => !f?.uploaded
                    ),
                    vehicleInsurance: (prev.vehicleInsurance || []).filter(
                      (f) => !f?.uploaded
                    ),
                    vehiclePuc: (prev.vehiclePuc || []).filter((f) => !f?.uploaded),
                  };
                  return mergeDocuments(cleared, vehicleDocs, docTypeMapping);
                });
              }
            } else {
              setFiles((prev) => ({
                ...prev,
                vehicleRegistration: (prev.vehicleRegistration || []).filter(
                  (f) => !f?.uploaded
                ),
                vehicleInsurance: (prev.vehicleInsurance || []).filter(
                  (f) => !f?.uploaded
                ),
                vehiclePuc: (prev.vehiclePuc || []).filter((f) => !f?.uploaded),
              }));
            }
          }

          if (normalizedPoNumber) {
            try {
              const poResponse = await poDetailsAPI.createOrGetPO(
                normalizedPoNumber
              );
              poCreated = !!poResponse.data?.created;

              if (poCreated) {
                createdItems.push("PO");
              }

              const poData = poResponse.data?.po;

              if (poData && poData.dapName) {
                if (typeof poData.dapName === "object" && poData.dapName.name) {
                  setDapName(poData.dapName.name);
                } else if (typeof poData.dapName === "string") {
                  setDapName(poData.dapName);
                }
              } else {
                setDapName("");
              }

              const isDropdownSelectedExistingPo =
                !poCreated &&
                !!selectedPoNumber &&
                String(selectedPoNumber) === normalizedPoNumber;

              if (isDropdownSelectedExistingPo) {
                try {
                  const responseDocs = Array.isArray(poResponse.data?.documents)
                    ? poResponse.data.documents
                    : [];

                  const poDocs =
                    responseDocs.length > 0
                      ? responseDocs
                      : (await documentsAPI.getDocumentsByPO(normalizedPoNumber))
                          .data?.documents || [];
                  if (poDocs.length > 0) {
                    setFiles((prev) => {
                      const cleared = {
                        ...prev,
                        po: (prev.po || []).filter((f) => !f?.uploaded),
                        do: (prev.do || []).filter((f) => !f?.uploaded),
                        beforeWeighing: (
                          prev.beforeWeighing || []
                        ).filter((f) => !f?.uploaded),
                        afterWeighing: (prev.afterWeighing || []).filter(
                          (f) => !f?.uploaded
                        ),
                      };
                      return mergeDocuments(cleared, poDocs, docTypeMapping);
                    });
                  }
                } catch (docError) {
                  console.error("Failed to fetch PO documents:", docError);
                }
              } else {
                setFiles((prev) => ({
                  ...prev,
                  po: (prev.po || []).filter((f) => !f?.uploaded),
                  do: (prev.do || []).filter((f) => !f?.uploaded),
                  beforeWeighing: (prev.beforeWeighing || []).filter(
                    (f) => !f?.uploaded
                  ),
                  afterWeighing: (prev.afterWeighing || []).filter(
                    (f) => !f?.uploaded
                  ),
                }));
              }
            } catch (poError) {
              console.error("Failed to create/get PO:", poError);
              showPopupMessage(
                "Failed to save PO details, but you can continue",
                "warning"
              );
            }
          }

          if (createdItems.length > 0) {
            if (vehicleCreated && poCreated) {
              showPopupMessage(
                `New Vehicle (${normalizedVehicleNumber}) and New PO (${normalizedPoNumber}) created successfully`,
                "info"
              );
            } else {
              const messages = [];
              if (vehicleCreated && normalizedVehicleNumber) {
                messages.push(
                  `New Vehicle (${normalizedVehicleNumber}) created successfully`
                );
              }
              if (poCreated && normalizedPoNumber) {
                messages.push(
                  `New PO (${normalizedPoNumber}) created successfully`
                );
              }

              if (messages.length > 0) {
                showPopupMessage(messages.join("\n"), "info");
              } else {
                const message = `${createdItems.join(
                  " and "
                )} numbers created successfully`;
                showPopupMessage(message, "info");
              }
            }
          }
        } catch (error) {
          console.error("Failed to save vehicle:", error);
          showPopupMessage(
            "Failed to save vehicle details, but you can continue",
            "warning"
          );
        } finally {
          setLoading(false);
        }
      }

      lastStep1NextRef.current = {
        vehicleNumber: normalizedVehicleNumber,
        poNumber: normalizedPoNumber,
      };
    }

    if (currentStep === 1) {
      const step1Errors = {};
      const normalizedDriverAadhar = normalizeAadharValue(formData.driverAadhar);
      const normalizedHelperAadhar = normalizeAadharValue(formData.helperAadhar);

      if (!formData.driverName || !(formData.driverName || "").trim()) {
        step1Errors.driverName = "Driver name is required";
      }
      if (!formData.driverPhone) {
        step1Errors.driverPhone = "Driver phone is required";
      }
      if (
        !normalizedDriverAadhar ||
        normalizedDriverAadhar.length !== 12
      ) {
        step1Errors.driverAadhar = "Driver Aadhar must be exactly 12 digits";
      }

      if (!formData.helperName || !(formData.helperName || "").trim()) {
        step1Errors.helperName = "Helper name is required";
      }
      if (!formData.helperPhone) {
        step1Errors.helperPhone = "Helper phone is required";
      }
      if (
        !normalizedHelperAadhar ||
        normalizedHelperAadhar.length !== 12
      ) {
        step1Errors.helperAadhar = "Helper Aadhar must be exactly 12 digits";
      }

      if (Object.keys(step1Errors).length > 0) {
        setErrors((prev) => ({ ...prev, ...step1Errors }));
        showPopupMessage(
          "Please fill in all driver and helper fields correctly",
          "warning"
        );
        return;
      }

      const currentDriverHelperData = {
        driverName: (formData.driverName || "").trim(),
        driverPhone: formData.driverPhone || "",
        driverLanguage: formData.driverLanguage || "en",
        driverAadhar: normalizedDriverAadhar,
        helperName: (formData.helperName || "").trim(),
        helperPhone: formData.helperPhone || "",
        helperLanguage: formData.helperLanguage || "en",
        helperAadhar: normalizedHelperAadhar,
      };

      const driverIdForSnapshot =
        typeof savedDriverData?.id === "number"
          ? savedDriverData.id
          : typeof allDrivers.find((d) => d.phoneNo === formData.driverPhone)?.id ===
            "number"
          ? allDrivers.find((d) => d.phoneNo === formData.driverPhone)?.id
          : null;
      const helperIdForSnapshot =
        typeof savedHelperData?.id === "number"
          ? savedHelperData.id
          : typeof allHelpers.find((h) => h.phoneNo === formData.helperPhone)?.id ===
            "number"
          ? allHelpers.find((h) => h.phoneNo === formData.helperPhone)?.id
          : null;

      let nextStep2Snapshot = {
        ...currentDriverHelperData,
        driverId: driverIdForSnapshot,
        helperId: helperIdForSnapshot,
      };

      const prevStep2Snapshot = lastStep2NextRef.current.snapshot;
      const step2Unchanged =
        !!prevStep2Snapshot &&
        prevStep2Snapshot.driverName === nextStep2Snapshot.driverName &&
        prevStep2Snapshot.driverPhone === nextStep2Snapshot.driverPhone &&
        prevStep2Snapshot.driverLanguage === nextStep2Snapshot.driverLanguage &&
        prevStep2Snapshot.driverAadhar === nextStep2Snapshot.driverAadhar &&
        prevStep2Snapshot.helperName === nextStep2Snapshot.helperName &&
        prevStep2Snapshot.helperPhone === nextStep2Snapshot.helperPhone &&
        prevStep2Snapshot.helperLanguage === nextStep2Snapshot.helperLanguage &&
        prevStep2Snapshot.helperAadhar === nextStep2Snapshot.helperAadhar &&
        prevStep2Snapshot.driverId === nextStep2Snapshot.driverId &&
        prevStep2Snapshot.helperId === nextStep2Snapshot.helperId;

      const hasChanged =
        !savedDriverHelperData ||
        !compareDriverHelperData(
          currentDriverHelperData,
          savedDriverHelperData
        );

      let driverHelperSaveFailed = false;

      if (!step2Unchanged && hasChanged) {
        try {
          setLoading(true);

          const driverPayload = {
            name: currentDriverHelperData.driverName,
            phoneNo: currentDriverHelperData.driverPhone,
            language: currentDriverHelperData.driverLanguage,
            uid: currentDriverHelperData.driverAadhar,
          };

          const helperPayload = {
            name: currentDriverHelperData.helperName,
            phoneNo: currentDriverHelperData.helperPhone,
            language: currentDriverHelperData.helperLanguage,
            uid: currentDriverHelperData.helperAadhar,
          };

          const [driverResponse, helperResponse] = await Promise.all([
            driversAPI.validateOrCreateDriverInfo(driverPayload),
            driversAPI.validateOrCreateHelperInfo(helperPayload),
          ]);

          const savedDriver = driverResponse.data?.driver;
          const savedHelper = helperResponse.data?.driver;
          const driverDocs = driverResponse.data?.documents || [];
          const helperDocs = helperResponse.data?.documents || [];

          if (savedDriver) {
            setSavedDriverData(savedDriver);
            setDriverSearch(savedDriver.name || "");
            setDriverExists(!!savedDriver.uid);
            setDriverChanged(false);
            setAllDrivers((prev) => {
              const withoutSamePhone = (prev || []).filter(
                (d) => d?.phoneNo !== savedDriver.phoneNo
              );
              return [savedDriver, ...withoutSamePhone];
            });
            setFormData((prev) => ({
              ...prev,
              driverAadhar: normalizeAadharValue(savedDriver.uid) || prev.driverAadhar,
            }));
          }

          if (savedHelper) {
            setSavedHelperData(savedHelper);
            setHelperSearch(savedHelper.name || "");
            setHelperExists(!!savedHelper.uid);
            setHelperChanged(false);
            setAllHelpers((prev) => {
              const withoutSamePhone = (prev || []).filter(
                (h) => h?.phoneNo !== savedHelper.phoneNo
              );
              return [savedHelper, ...withoutSamePhone];
            });
            setFormData((prev) => ({
              ...prev,
              helperAadhar: normalizeAadharValue(savedHelper.uid) || prev.helperAadhar,
            }));
          }

          nextStep2Snapshot = {
            ...nextStep2Snapshot,
            driverId: typeof savedDriver?.id === "number" ? savedDriver.id : null,
            helperId: typeof savedHelper?.id === "number" ? savedHelper.id : null,
          };

          if (driverDocs.length > 0 || helperDocs.length > 0) {
            setFiles((prev) => {
              const existingDriver = prev.driverAadhar;
              const existingHelper = prev.helperAadhar;

              const driverArr = Array.isArray(existingDriver)
                ? existingDriver
                : existingDriver
                ? [existingDriver]
                : [];
              const helperArr = Array.isArray(existingHelper)
                ? existingHelper
                : existingHelper
                ? [existingHelper]
                : [];

              const cleared = {
                ...prev,
                driverAadhar: driverArr.filter((f) => !f?.uploaded),
                helperAadhar: helperArr.filter((f) => !f?.uploaded),
              };

              const withDriver =
                driverDocs.length > 0
                  ? mergeDocuments(cleared, driverDocs, docTypeMapping)
                  : cleared;
              return helperDocs.length > 0
                ? mergeDocuments(withDriver, helperDocs, docTypeMapping)
                : withDriver;
            });
          }

          setSavedDriverHelperData(currentDriverHelperData);

          showPopupMessage(
            "Driver and Helper info saved successfully",
            "info"
          );
        } catch (error) {
          console.error("Failed to save driver/helper:", error);
          showPopupMessage(
            error.response?.data?.error ||
              "Failed to save driver/helper info",
            "warning"
          );

          driverHelperSaveFailed = true;
        } finally {
          setLoading(false);
        }
      }

      if (driverHelperSaveFailed) {
        return;
      }

      lastStep2NextRef.current.snapshot = nextStep2Snapshot;
    }

    setCurrentStep((prev) => Math.min(prev + 1, steps.length - 1));
  };

  const handlePreviousStep = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 0));
  };

  const validateAll = useCallback(() => {
    const allFields = Object.values(stepFieldMap).flat();
    return validateFields(allFields);
  }, [stepFieldMap, validateFields]);

  const resetForm = async () => {
    const customerEmail = user?.email || "";
    const customerPhone = user?.phone || user?.telephone || "";

    setFormData({
      ...initialFormData,
      customerEmail,
      customerPhone,
    });
    setFiles(initialFiles);
    setErrors({});
    setSubmitError("");
    setCurrentStep(0);
    setSuccessData(null);
    setMockNotice("");
    setShowNotify(false);
    setVehicleSaved(false);
    setSavedDriverHelperData(null);
    setSavedDriverData(null);
    setSavedHelperData(null);
    setAllDrivers([]);
    setAllHelpers([]);
    setDriverSearch("");
    setHelperSearch("");
    setSelectedVehicle(null);
    setSelectedPoNumber(null);
    setDriverExists(false);
    setHelperExists(false);
    setDapName("");
    setPoSearch("");
    setVehicleSearch("");
    setHasShownDriverHelperPopup(false);

    lastStep1NextRef.current = { vehicleNumber: null, poNumber: null };
    lastStep2NextRef.current.snapshot = null;

    localStorage.removeItem(storageKeyFormData);
    localStorage.removeItem(storageKeyFiles);
    localStorage.removeItem(storageKeyCurrentStep);
    localStorage.removeItem(storageKeySuccessData);
    localStorage.removeItem("customerPortal_formData");
    localStorage.removeItem("customerPortal_files");
    localStorage.removeItem("customerPortal_currentStep");

    try {
      const vehiclesResponse = await vehiclesAPI.getMyVehicles();
      setMyVehicles(vehiclesResponse.data.vehicles || []);
      setVehicles(vehiclesResponse.data.vehicles || []);

      const poResponse = await poDetailsAPI.getMyPOs();
      setPoNumbers(poResponse.data.pos || []);
    } catch (error) {
      console.error("Failed to refresh data:", error);
    }
  };

  useEffect(() => {
    if (showNotify) {
      const id = setTimeout(() => setShowNotify(false), 8000);
      return () => clearTimeout(id);
    }
    return undefined;
  }, [showNotify]);

  useEffect(() => {
    if (showPopup) {
      const id = setTimeout(() => setShowPopup(false), 5000);
      return () => clearTimeout(id);
    }
    return undefined;
  }, [showPopup]);

  const showPopupMessage = (message, variant = "info") => {
    setPopupMessage(message);
    setPopupVariant(variant);
    setShowPopup(true);
  };

  const makeDemoQr = (vehicleNumber, driverPhone) => {
    const payload = {
      type: "ENTRY_QR_DEMO",
      vehicleNumber,
      driverPhone,
      ts: Date.now(),
    };
    const data = encodeURIComponent(JSON.stringify(payload));
    return `https://api.qrserver.com/v1/create-qr-code/?size=320x320&data=${data}`;
  };

  const handleDownloadQr = async () => {
    if (!successData) {
      return;
    }
    const qrCodeImage =
      successData.qrCodeImage ||
      makeDemoQr(successData.vehicleNumber, successData.driverPhone);
    if (!qrCodeImage) {
      return;
    }
    const sanitizedVehicle = (successData.vehicleNumber || "vehicle").replace(
      /[^A-Z0-9-]+/gi,
      "-"
    );
    const filename = `entry-qr-${sanitizedVehicle}.png`;

    try {
      const imageSrc = qrCodeImage;

      if (imageSrc.startsWith("data:")) {
        const link = document.createElement("a");
        link.href = imageSrc;
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        return;
      }

      const response = await fetch(imageSrc);
      if (!response.ok) {
        throw new Error("Failed to fetch QR image for download.");
      }
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (err) {
      setSubmitError(
        "Unable to download QR code. Please try opening the image in a new tab."
      );
    }
  };

  const handleSubmit = async () => {
    if (!validateAll()) {
      setSubmitError("Please fix the highlighted errors before submitting.");
      const errorKeys = Object.keys(errors);
      if (errorKeys.length > 0) {
        const targetStep = Object.entries(stepFieldMap).find(
          ([stepId, fields]) =>
            fields.some((f) => errorKeys.includes(f) || f === "_anyDocument")
        )?.[0];
        if (typeof targetStep !== "undefined") {
          setCurrentStep(Number(targetStep));
        }
      }
      return;
    }

    if (!formData.poNumber || !formData.poNumber.trim()) {
      setSubmitError(
        "PO number is required. Please go back to Step 1 and enter it."
      );
      setCurrentStep(0);
      return;
    }

    const hasAnyDocument = Object.values(files).some((fileData) => {
      if (Array.isArray(fileData)) {
        return fileData.length > 0;
      }
      return !!fileData;
    });

    if (!hasAnyDocument) {
      setCurrentStep(2);
      showPopupMessage("Please upload at least one document", "warning");
      setSubmitError("At least one document upload is required to submit.");
      return;
    }

    setLoading(true);
    setSubmitError("");

    try {
      const filesToUpload = [];

      Object.entries(files).forEach(([docType, fileArray]) => {
        const arr = Array.isArray(fileArray) ? fileArray : [fileArray];
        arr.forEach((file) => {
          if (file && !file.fromDatabase) {
            filesToUpload.push({
              documentType: docType,
              file: file,
            });
          }
        });
      });

      const uploadedFileIds = [];

      for (const { documentType, file } of filesToUpload) {
        const uploadFormData = new FormData();
        uploadFormData.append("file", file);
        uploadFormData.append("document_type", documentType);
        uploadFormData.append("vehicle_number", formData.vehicleNumber.trim());
        uploadFormData.append("po_number", formData.poNumber.trim());
        uploadFormData.append("driver_phone", formData.driverPhone);
        uploadFormData.append("helper_phone", formData.helperPhone);

        try {
          const uploadResponse = await documentsAPI.uploadToDocumentControl(
            uploadFormData
          );
          if (uploadResponse.data?.document) {
            uploadedFileIds.push(uploadResponse.data.document.id);
          }
        } catch (uploadError) {
          console.error(
            `Failed to upload ${documentType}:`,
            uploadError
          );
          setSubmitError(
            `Failed to upload ${documentType}. Please try again.`
          );
          return;
        }
      }

      const submissionPayload = {
        customer_email: formData.customerEmail,
        customer_phone: formData.customerPhone,
        vehicle_number: formData.vehicleNumber.trim(),
        poNumber: formData.poNumber.trim(),
        driver_name: formData.driverName.trim(),
        driver_phone: formData.driverPhone,
        driver_language: formData.driverLanguage,
        driver_aadhar: normalizeAadharValue(formData.driverAadhar),
        helper_name: formData.helperName.trim(),
        helper_phone: formData.helperPhone,
        helper_language: formData.helperLanguage,
        helper_aadhar: normalizeAadharValue(formData.helperAadhar),
        document_ids: uploadedFileIds,
      };

      const submissionResponse = await submissionsAPI.createSubmission(
        submissionPayload
      );

      console.log("Submission successful:", submissionResponse.data);

      setSuccessData({
        vehicleNumber: formData.vehicleNumber,
        driverPhone: formData.driverPhone,
        qrCodeImage: submissionResponse.data.qrCodeImage || makeDemoQr(
          formData.vehicleNumber,
          formData.driverPhone
        ),
      });

      setShowNotify(true);
    } catch (error) {
      console.error("Submission error:", error);
      setSubmitError(
        error.response?.data?.error ||
          "Failed to submit. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  if (successData) {
    const qrCodeImage =
      successData.qrCodeImage ||
      makeDemoQr(successData.vehicleNumber, successData.driverPhone);
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 px-4 py-10">
        {showNotify && (
          <div className="fixed right-6 top-6 z-50 w-full max-w-sm rounded-xl bg-white shadow-xl">
            <div className="flex items-start gap-3 p-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-50">
                <CheckCircle
                  className="h-5 w-5 text-green-600"
                  aria-hidden="true"
                />
              </div>
              <div className="flex-1">
                <p className="text-sm font-semibold text-gray-900">
                  QR Code Sent Successfully!
                </p>
                <p className="mt-1 text-sm text-gray-600">
                  QR code has been emailed to{" "}
                  <span className="font-medium text-gray-900">
                    {formData.customerEmail || "—"}
                  </span>
                </p>
                <p className="mt-1 text-sm text-gray-600">
                  and SMS sent to{" "}
                  <span className="font-medium text-gray-900">
                    {formData.customerPhone || "—"}
                  </span>
                </p>
                <p className="mt-2 text-xs text-blue-600">
                  ℹ️ Check your email inbox (and spam folder)
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowNotify(false)}
                className="ml-2 inline-flex h-8 w-8 items-center justify-center rounded-md text-gray-400 hover:bg-gray-100 hover:text-gray-600"
                aria-label="Dismiss notification"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}
        {showPopup && (
          <div className="fixed right-6 top-28 z-50 w-full max-w-sm rounded-xl bg-white shadow-lg">
            <div
              className={`flex items-start gap-3 p-4 ${
                popupVariant === "warning"
                  ? "border-l-4 border-yellow-400"
                  : "border-l-4 border-blue-400"
              }`}
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gray-50">
                <FileText className="h-5 w-5 text-gray-700" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-semibold text-gray-900">
                  {popupMessage}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowPopup(false)}
                className="ml-2 inline-flex h-8 w-8 items-center justify-center rounded-md text-gray-400 hover:bg-gray-100 hover:text-gray-600"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}
        <div className="mx-auto max-w-4xl">
          <div className="rounded-2xl bg-white p-8 shadow-xl">
            <header className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between mb-6">
              <div className="flex items-center gap-4">
                <div className="flex h-14 w-14 items-center justify-center rounded-full bg-blue-100">
                  <Scan className="h-7 w-7 text-blue-600" aria-hidden="true" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">
                    Entry QR Code Generated
                  </h1>
                  <p className="text-sm text-gray-500">
                    Share this QR code with the driver for gate access.
                  </p>
                </div>
              </div>
              <div className="flex gap-2 flex-col sm:flex-row">
                <button
                  type="button"
                  onClick={handleLogout}
                  disabled={logoutLoading}
                  className="inline-flex items-center justify-center gap-2 rounded-xl border border-red-500 px-4 py-2 text-sm font-semibold text-red-600 transition-all duration-200 hover:bg-red-50 disabled:opacity-60 disabled:cursor-not-allowed focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500 focus-visible:ring-offset-2"
                >
                  {logoutLoading ? (
                    <Loader className="h-4 w-4 animate-spin" />
                  ) : (
                    <LogOut className="h-4 w-4" aria-hidden="true" />
                  )}
                  {logoutLoading ? "Signing out..." : "Sign Out"}
                </button>
              </div>
            </header>
            {mockNotice && (
              <div className="mt-6 flex items-start gap-3 rounded-xl border border-blue-200 bg-blue-50 px-4 py-3 text-sm text-blue-800">
                <AlertCircle className="mt-0.5 h-5 w-5" aria-hidden="true" />
                <span>{mockNotice}</span>
              </div>
            )}
            <div className="mt-8 grid gap-8 lg:grid-cols-2">
              <div className="flex flex-col items-center justify-center rounded-2xl border border-gray-200 bg-gray-50 p-6">
                <img
                  src={qrCodeImage}
                  alt="Driver entry QR code"
                  className="h-60 w-60 rounded-xl border border-gray-200 bg-white object-contain p-4"
                />
                <div className="mt-4 space-y-1 text-center">
                  <p className="text-sm text-gray-500">Vehicle Number</p>
                  <p className="text-lg font-semibold text-gray-900">
                    {successData.vehicleNumber}
                  </p>
                  <p className="text-sm text-gray-500">Driver Phone</p>
                  <p className="text-lg font-semibold text-gray-900">
                    {successData.driverPhone}
                  </p>
                </div>
              </div>
              <div className="flex flex-col justify-between rounded-2xl border border-blue-100 bg-blue-50 p-6">
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <CheckCircle
                      className="mt-0.5 h-5 w-5 text-green-500"
                      aria-hidden="true"
                    />
                    <p className="text-sm text-gray-700">
                      The driver must present this QR code at the gate entrance.
                      A token number will be sent to the driver's phone upon
                      scanning.
                    </p>
                  </div>
                  <div className="flex items-start gap-3">
                    <AlertCircle
                      className="mt-0.5 h-5 w-5 text-blue-500"
                      aria-hidden="true"
                    />
                    <p className="text-sm text-gray-700">
                      Keep a digital and printed copy handy to avoid delays at
                      the security checkpoint.
                    </p>
                  </div>
                </div>
                <div className="mt-6 flex flex-col gap-3 sm:flex-row">
                  <button
                    type="button"
                    onClick={handleDownloadQr}
                    className="inline-flex items-center justify-center gap-2 rounded-xl bg-green-500 px-5 py-3 text-sm font-semibold text-white transition-all duration-200 hover:bg-green-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green-500 focus-visible:ring-offset-2"
                  >
                    <Download className="h-4 w-4" aria-hidden="true" />
                    Download QR Code
                  </button>
                  <button
                    type="button"
                    onClick={resetForm}
                    className="inline-flex items-center justify-center gap-2 rounded-xl border border-blue-500 px-5 py-3 text-sm font-semibold text-blue-600 transition-all duration-200 hover:bg-blue-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
                  >
                    <RefreshCw className="h-4 w-4" aria-hidden="true" />
                    Submit Another Entry
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 px-4 py-10">
      {showNotify && (
        <div className="fixed right-6 top-6 z-50 w-full max-w-sm rounded-xl bg-white shadow-xl">
          <div className="flex items-start gap-3 p-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-50">
              <CheckCircle
                className="h-5 w-5 text-green-600"
                aria-hidden="true"
              />
            </div>
            <div className="flex-1">
              <p className="text-sm font-semibold text-gray-900">
                QR code link emailed
              </p>
              <p className="mt-1 text-sm text-gray-600">
                QR code link emailed on{" "}
                <span className="font-medium text-gray-900">
                  {formData.customerEmail || "—"}
                </span>
              </p>
              <p className="mt-1 text-sm text-gray-600">
                Your mobile number:{" "}
                <span className="font-medium text-gray-900">
                  {formData.customerPhone || "—"}
                </span>
              </p>
            </div>
            <button
              type="button"
              onClick={() => setShowNotify(false)}
              className="ml-2 inline-flex h-8 w-8 items-center justify-center rounded-md text-gray-400 hover:bg-gray-100 hover:text-gray-600"
              aria-label="Dismiss notification"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}
      {showPopup && (
        <div className="fixed right-6 top-28 z-50 w-full max-w-sm rounded-xl bg-white shadow-lg">
          <div
            className={`flex items-start gap-3 p-4 ${
              popupVariant === "warning"
                ? "border-l-4 border-yellow-400"
                : "border-l-4 border-blue-400"
            }`}
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gray-50">
              <FileText className="h-5 w-5 text-gray-700" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-semibold text-gray-900">
                {popupMessage}
              </p>
            </div>
            <button
              type="button"
              onClick={() => setShowPopup(false)}
              className="ml-2 inline-flex h-8 w-8 items-center justify-center rounded-md text-gray-400 hover:bg-gray-100 hover:text-gray-600"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}
      <div className="mx-auto max-w-4xl">
        <div className="rounded-2xl bg-white p-8 shadow-xl">
          <div className="flex flex-col gap-6">
            <header className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-4">
                <div className="flex h-14 w-14 items-center justify-center rounded-full bg-blue-100">
                  <Truck className="h-7 w-7 text-blue-600" aria-hidden="true" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">
                    Customer Gate Entry Portal
                  </h1>
                </div>
              </div>
              <div className="flex gap-2 flex-col sm:flex-row">
                <button
                  type="button"
                  onClick={handleLogout}
                  disabled={logoutLoading}
                  className="inline-flex items-center justify-center gap-2 rounded-xl border border-red-500 px-4 py-2 text-sm font-semibold text-red-600 transition-all duration-200 hover:bg-red-50 disabled:opacity-60 disabled:cursor-not-allowed focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500 focus-visible:ring-offset-2"
                >
                  {logoutLoading ? (
                    <Loader className="h-4 w-4 animate-spin" />
                  ) : (
                    <LogOut className="h-4 w-4" aria-hidden="true" />
                  )}
                  {logoutLoading ? "Signing out..." : "Sign Out"}
                </button>
              </div>
            </header>

            <nav className="grid gap-3 sm:grid-cols-3">
              {steps.map((step) => {
                const isActive = currentStep === step.id;
                const isCompleted = currentStep > step.id;
                return (
                  <div
                    key={step.id}
                    className={`rounded-xl border px-4 py-3 transition-all duration-200 ${
                      isActive
                        ? "border-blue-500 bg-blue-50"
                        : isCompleted
                        ? "border-green-400 bg-green-50"
                        : "border-gray-200 bg-gray-50"
                    }`}
                  >
                    <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                      Step {step.id + 1}
                    </p>
                    <p className="mt-1 text-sm font-semibold text-gray-800">
                      {step.title}
                    </p>
                    <p className="mt-1 text-xs text-gray-500">
                      {step.description}
                    </p>
                  </div>
                );
              })}
            </nav>

            <form className="space-y-8">
              {currentStep === 0 && (
                <Step1VehicleInfo
                  formData={formData}
                  setFormData={setFormData}
                  handleInputChange={handleInputChange}
                  errors={errors}
                  clearFieldError={clearFieldError}
                  vehicles={vehicles}
                  vehicleDropdownOpen={vehicleDropdownOpen}
                  setVehicleDropdownOpen={setVehicleDropdownOpen}
                  vehicleSearch={vehicleSearch}
                  setVehicleSearch={setVehicleSearch}
                  loadingVehicles={loadingVehicles}
                  selectedVehicle={selectedVehicle}
                  setSelectedVehicle={setSelectedVehicle}
                  loadingVehicleData={loadingVehicleData}
                  poNumbers={poNumbers}
                  poDropdownOpen={poDropdownOpen}
                  setPoDropdownOpen={setPoDropdownOpen}
                  poSearch={poSearch}
                  setPoSearch={setPoSearch}
                  setSelectedPoNumber={setSelectedPoNumber}
                  loadingPos={loadingPos}
                  dapName={dapName}
                  loadingDap={loadingDap}
                  vehicleInputRef={vehicleInputRef}
                  vehicleListRef={vehicleListRef}
                  poInputRef={poInputRef}
                  poListRef={poListRef}
                />
              )}

              {currentStep === 1 && (
                <Step2DriverInfo
                  formData={formData}
                  setFormData={setFormData}
                  handleInputChange={handleInputChange}
                  errors={errors}
                  clearFieldError={clearFieldError}
                  allDrivers={allDrivers}
                  allHelpers={allHelpers}
                  driverDropdownOpen={driverDropdownOpen}
                  setDriverDropdownOpen={setDriverDropdownOpen}
                  helperDropdownOpen={helperDropdownOpen}
                  setHelperDropdownOpen={setHelperDropdownOpen}
                  driverSearch={driverSearch}
                  setDriverSearch={setDriverSearch}
                  helperSearch={helperSearch}
                  setHelperSearch={setHelperSearch}
                  prefDropdownOpen={prefDropdownOpen}
                  setPrefDropdownOpen={setPrefDropdownOpen}
                  prefSearch={prefSearch}
                  setPrefSearch={setPrefSearch}
                  prefHighlight={prefHighlight}
                  setPrefHighlight={setPrefHighlight}
                  helperPrefDropdownOpen={helperPrefDropdownOpen}
                  setHelperPrefDropdownOpen={setHelperPrefDropdownOpen}
                  helperPrefSearch={helperPrefSearch}
                  setHelperPrefSearch={setHelperPrefSearch}
                  helperPrefHighlight={helperPrefHighlight}
                  setHelperPrefHighlight={setHelperPrefHighlight}
                  savedDriverData={savedDriverData}
                  savedHelperData={savedHelperData}
                  driverExists={driverExists}
                  helperExists={helperExists}
                  driverChanged={driverChanged}
                  helperChanged={helperChanged}
                  driverInputRef={driverInputRef}
                  driverListRef2={driverListRef2}
                  helperInputRef={helperInputRef}
                  helperListRef2={helperListRef2}
                  prefButtonRef={prefButtonRef}
                  prefListRef={prefListRef}
                  helperPrefButtonRef={helperPrefButtonRef}
                  helperPrefListRef={helperPrefListRef}
                  handleDriverSelect={handleDriverSelect}
                  handleHelperSelect={handleHelperSelect}
                  handleSaveDriver={handleSaveDriver}
                  handleSaveHelper={handleSaveHelper}
                  setShowDriverModal={setShowDriverModal}
                  setShowHelperModal={setShowHelperModal}
                  savingDriver={savingDriver}
                  savingHelper={savingHelper}
                  loading={loading}
                  autoFillData={autoFillData}
                  loadingVehicleData={loadingVehicleData}
                />
              )}

              {currentStep === 2 && (
                <Step3DocumentUpload
                  files={files}
                  setFiles={setFiles}
                  selectedDocType={selectedDocType}
                  setSelectedDocType={setSelectedDocType}
                  stagedFile={stagedFile}
                  setStagedFile={setStagedFile}
                  docDropdownOpen={docDropdownOpen}
                  setDocDropdownOpen={setDocDropdownOpen}
                  docSearch={docSearch}
                  setDocSearch={setDocSearch}
                  docHighlight={docHighlight}
                  setDocHighlight={setDocHighlight}
                  errors={errors}
                  setErrors={setErrors}
                  docButtonRef={docButtonRef}
                  docListRef={docListRef}
                  handleStageFile={handleStageFile}
                  handleUploadStaged={handleUploadStaged}
                  handleClearUploaded={handleClearUploaded}
                  loading={loading}
                  DocumentUploadField={DocumentUploadField}
                />
              )}

              {submitError && (
                <div className="flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                  <AlertCircle className="mt-0.5 h-5 w-5" aria-hidden="true" />
                  <span>{submitError}</span>
                </div>
              )}

              <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                <button
                  type="button"
                  onClick={handlePreviousStep}
                  disabled={currentStep === 0 || loading}
                  className="inline-flex items-center justify-center gap-2 rounded-xl border border-gray-200 bg-white px-6 py-3 text-sm font-semibold text-gray-700 shadow-sm transition-all duration-200 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
                >
                  <ChevronLeft className="h-4 w-4" />
                  Previous
                </button>
                {currentStep !== steps.length - 1 && (
                  <button
                    type="button"
                    onClick={handleNextStep}
                    disabled={loading}
                    className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-6 py-3 text-sm font-semibold text-white transition-all duration-200 hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-blue-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
                  >
                    {loading ? (
                      <>
                        <Loader className="h-4 w-4 animate-spin" />
                        Processing...
                      </>
                    ) : (
                      <>
                        Next
                        <ChevronDown className="h-4 w-4 rotate-[-90deg]" />
                      </>
                    )}
                  </button>
                )}
                {currentStep === steps.length - 1 && (
                  <button
                    type="button"
                    onClick={handleSubmit}
                    disabled={loading}
                    className="ml-auto inline-flex items-center justify-center gap-2 rounded-xl bg-green-600 px-6 py-3 text-sm font-semibold text-white transition-all duration-200 hover:bg-green-700 disabled:cursor-not-allowed disabled:bg-green-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green-500 focus-visible:ring-offset-2"
                  >
                    {loading ? (
                      <>
                        <Loader className="h-4 w-4 animate-spin" />
                        Submitting...
                      </>
                    ) : (
                      <>
                        <Send className="h-4 w-4" />
                        <span className="hidden sm:inline">
                          Submit Entry
                        </span>
                      </>
                    )}
                  </button>
                )}
              </div>
            </form>
          </div>
        </div>
      </div>

      {/* Driver Modal */}
      <DriverHelperModal
        isOpen={showDriverModal}
        onClose={() => setShowDriverModal(false)}
        type="Driver"
        onSave={handleDriverModalSave}
        loading={loading}
      />

      {/* Helper Modal */}
      <DriverHelperModal
        isOpen={showHelperModal}
        onClose={() => setShowHelperModal(false)}
        type="Helper"
        onSave={handleHelperModalSave}
        loading={loading}
      />
    </div>
  );
};

export default CustomerPortal;
