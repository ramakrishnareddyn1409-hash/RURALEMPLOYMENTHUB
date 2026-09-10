import React from "react";
import { MapPin, RotateCcw } from "lucide-react";
import {
  getAllStates,
  getDistricts,
  getMandals,
  getPanchayats,
  getVillages,
} from "../data/locationHierarchy";

const LocationFilterBar = ({
  selectedState = "all",
  selectedDistrict = "all",
  selectedMandal = "all",
  selectedPanchayat = "all",
  selectedVillage = "all",
  onChange,
  onReset,
  className = "",
  showReset = true,
}) => {
  const states = getAllStates();
  const districts = selectedState !== "all" ? getDistricts(selectedState) : [];
  const mandals =
    selectedState !== "all" && selectedDistrict !== "all"
      ? getMandals(selectedState, selectedDistrict)
      : [];
  const panchayats =
    selectedState !== "all" && selectedDistrict !== "all"
      ? getPanchayats(selectedState, selectedDistrict, selectedMandal !== "all" ? selectedMandal : null)
      : [];
  const villages =
    selectedState !== "all" && selectedDistrict !== "all" && selectedPanchayat !== "all"
      ? getVillages(
          selectedState,
          selectedDistrict,
          selectedMandal !== "all" ? selectedMandal : null,
          selectedPanchayat
        )
      : [];

  const handleStateChange = (e) => {
    onChange({
      state: e.target.value,
      district: "all",
      mandal: "all",
      panchayat: "all",
      village: "all",
    });
  };

  const handleDistrictChange = (e) => {
    onChange({
      state: selectedState,
      district: e.target.value,
      mandal: "all",
      panchayat: "all",
      village: "all",
    });
  };

  const handleMandalChange = (e) => {
    onChange({
      state: selectedState,
      district: selectedDistrict,
      mandal: e.target.value,
      panchayat: "all",
      village: "all",
    });
  };

  const handlePanchayatChange = (e) => {
    onChange({
      state: selectedState,
      district: selectedDistrict,
      mandal: selectedMandal,
      panchayat: e.target.value,
      village: "all",
    });
  };

  const handleVillageChange = (e) => {
    onChange({
      state: selectedState,
      district: selectedDistrict,
      mandal: selectedMandal,
      panchayat: selectedPanchayat,
      village: e.target.value,
    });
  };

  const isFiltered =
    selectedState !== "all" ||
    selectedDistrict !== "all" ||
    selectedMandal !== "all" ||
    selectedPanchayat !== "all" ||
    selectedVillage !== "all";

  return (
    <div
      className={`p-3.5 bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-xs ${className}`}
    >
      <div className="flex flex-wrap items-center gap-2.5">
        <div className="flex items-center gap-1.5 text-xs font-bold text-gray-700 dark:text-gray-300 mr-1">
          <MapPin className="w-4 h-4 text-primary-500 shrink-0" />
          <span className="hidden sm:inline">Jurisdiction Hierarchy:</span>
        </div>

        {/* State */}
        <div className="flex-1 min-w-[120px]">
          <select
            value={selectedState}
            onChange={handleStateChange}
            className="w-full text-xs font-semibold py-1.5 px-2.5 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 text-gray-800 dark:text-gray-200 focus:outline-none focus:ring-1 focus:ring-primary-500"
          >
            <option value="all">All States</option>
            {states.map((st) => (
              <option key={st} value={st}>
                {st}
              </option>
            ))}
          </select>
        </div>

        {/* District */}
        <div className="flex-1 min-w-[120px]">
          <select
            value={selectedDistrict}
            onChange={handleDistrictChange}
            disabled={selectedState === "all"}
            className="w-full text-xs font-semibold py-1.5 px-2.5 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 text-gray-800 dark:text-gray-200 disabled:opacity-50 focus:outline-none focus:ring-1 focus:ring-primary-500"
          >
            <option value="all">All Districts</option>
            {districts.map((d) => (
              <option key={d} value={d}>
                {d}
              </option>
            ))}
          </select>
        </div>

        {/* Mandal / Block */}
        <div className="flex-1 min-w-[120px]">
          <select
            value={selectedMandal}
            onChange={handleMandalChange}
            disabled={selectedDistrict === "all"}
            className="w-full text-xs font-semibold py-1.5 px-2.5 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 text-gray-800 dark:text-gray-200 disabled:opacity-50 focus:outline-none focus:ring-1 focus:ring-primary-500"
          >
            <option value="all">All Mandals / Blocks</option>
            {mandals.map((m) => (
              <option key={m} value={m}>
                {m}
              </option>
            ))}
          </select>
        </div>

        {/* Gram Panchayat */}
        <div className="flex-1 min-w-[120px]">
          <select
            value={selectedPanchayat}
            onChange={handlePanchayatChange}
            disabled={selectedDistrict === "all"}
            className="w-full text-xs font-semibold py-1.5 px-2.5 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 text-gray-800 dark:text-gray-200 disabled:opacity-50 focus:outline-none focus:ring-1 focus:ring-primary-500"
          >
            <option value="all">All Panchayats</option>
            {panchayats.map((p) => (
              <option key={p} value={p}>
                {p}
              </option>
            ))}
          </select>
        </div>

        {/* Village / Habitation */}
        <div className="flex-1 min-w-[120px]">
          <select
            value={selectedVillage}
            onChange={handleVillageChange}
            disabled={selectedPanchayat === "all"}
            className="w-full text-xs font-semibold py-1.5 px-2.5 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 text-gray-800 dark:text-gray-200 disabled:opacity-50 focus:outline-none focus:ring-1 focus:ring-primary-500"
          >
            <option value="all">All Villages</option>
            {villages.map((v) => (
              <option key={v} value={v}>
                {v}
              </option>
            ))}
          </select>
        </div>

        {/* Reset Filter Button */}
        {showReset && isFiltered && (
          <button
            type="button"
            onClick={onReset}
            className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 text-xs font-medium flex items-center gap-1 transition"
            title="Reset location hierarchy filters"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span className="hidden md:inline">Reset</span>
          </button>
        )}
      </div>
    </div>
  );
};

export default LocationFilterBar;
