import { getMasterById } from "./masterLookup";

export const getDepartment = (masters, deptId) =>
  getMasterById(masters, "departments", deptId, "department_id");


export const getCity = (masters, cityId) =>
  getMasterById(masters, "cities", cityId, "city_id");

export const getState = (masters, stateId) =>
  getMasterById(masters, "states", stateId, "state_id");


export const getLocation = (masters, locationId) =>
  getMasterById(masters, "locations", locationId, "location_id");

export const getJobGrade = (masters, gradeId) =>
  getMasterById(masters, "job_grades", gradeId, "job_grade_id");

export const getSkill = (masters, skillId) =>
  getMasterById(masters, "skills", skillId, "skill_id");

export const getEmploymentType = (masters, employmentTypeId) =>
  getMasterById(
    masters,
    "employment_types",
    employmentTypeId,
    "employment_type_id"
  );


export const getNationality = (masters, countryId) =>
  getMasterById(masters, "countries", countryId, "countryId");


export const getGender = (masters, genderId) =>
  getMasterById(masters, "genders", genderId, "genderId");


export const getMaritalStatus = (masters, maritalStatusId) =>
  getMasterById(
    masters,
    "marital_statuses",
    maritalStatusId,
    "maritalStatusId"
  );

export const getReligion = (masters, religionId) =>
  getMasterById(masters, "religions", religionId, "religionId");

export const getReservation = (masters, reservationId) =>
  getMasterById(
    masters,
    "reservation_categories",
    reservationId,
    "reservationCategoriesId"
  );

export const getEducationLevel = (masters, educationLevelId) =>
  getMasterById(
    masters,
    "education_levels",
    educationLevelId,
    "documentTypeId"
  );

export const getSpecialization = (masters, specializationId) =>
  getMasterById(
    masters,
    "specializations",
    specializationId,
    "specializationId"
  );

export const getMandatoryQualification = (masters, qualificationId) =>
  getMasterById(
    masters,
    "mandatory_qualifications",
    qualificationId,
    "educationQualificationsId"
  );
