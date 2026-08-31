export const mapVacancyBreakdown = (
    apiResponse,
    masterData = {}
) => {

    const reservationMap = {};
    const disabilityMap = {};

    (masterData?.reservationCategories || []).forEach((item) => {
        reservationMap[item.id] = item.code;
    });

    (masterData?.disabilityCategories || []).forEach((item) => {
        disabilityMap[item.id] =
            item.disabilityCode || item.code;
    });


    (masterData?.disabilityCategories || []).forEach((item) => {
        disabilityMap[item.id] =
            item.disabilityCode || item.code;
    });


    return {
        positions: (
            Array.isArray(apiResponse)
                ? apiResponse
                : apiResponse?.data || []
        ).map((position) => ({
            id: position.masterPositionsId,

            positionName:
                masterData?.masterPositions?.find(
                    p => String(p.id) === String(position.masterPositionId)
                )?.name || "-",

            employmentType:
                masterData?.employmentTypes?.find(
                    (item) =>
                        String(item.id).trim() ===
                        String(position.employmentType).trim()
                )?.name || "-",
            department:
                masterData?.departments?.find(
                    (item) =>
                        String(item.id).trim() ===
                        String(position.deptId).trim()
                )?.name || "-",

            contractPeriod:
                position.contractYears ?? "-",




            eligibilityAge:
                `${position.eligibilityAgeMin}-${position.eligibilityAgeMax}`,

            vacancies: position.totalVacancies,

            experience:
                `${position.mandatoryExperienceMonths || 0} Months`,

            reservationType: position.isLocationWise
                ? "STATE_WISE"
                : "NATIONAL",


            nationalReservation: (() => {
                const row = {
                    sc: 0,
                    st: 0,
                    obc: 0,
                    ews: 0,
                    gen: 0,

                    hi: 0,
                    oc: 0,
                    vi: 0,
                    idd: 0,

                    total: position.totalVacancies || 0,
                };

                (position.nationalBreakdown || []).forEach((cat) => {

                    // console.log("National Category Debug", {
                    //     reservationCategoryId: cat.reservationCategoryId,
                    //     reservationCode:
                    //         reservationMap[cat.reservationCategoryId],
                    //     vacancyCount: cat.vacancyCount,
                    //     isDisability: cat.isDisability,
                    // });
                    if (!cat.isDisability) {
                        const code =
                            reservationMap[cat.reservationCategoryId];

                        switch (code) {
                            case "SC":
                                row.sc = cat.vacancyCount || 0;
                                break;
                            case "ST":
                                row.st = cat.vacancyCount || 0;
                                break;
                            case "OBC":
                                row.obc = cat.vacancyCount || 0;
                                break;
                            case "EWS":
                                row.ews = cat.vacancyCount || 0;
                                break;
                            case "GEN":
                                row.gen = cat.vacancyCount || 0;
                                break;
                            default:
                                break;
                        }
                    } else {
                        const code =
                            disabilityMap[cat.disabilityCategoryId];

                        switch (code) {
                            case "HI":
                                row.hi = cat.vacancyCount || 0;
                                break;
                            case "OC":
                                row.oc = cat.vacancyCount || 0;
                                break;
                            case "VI":
                                row.vi = cat.vacancyCount || 0;
                                break;
                            case "ID":
                                row.idd = cat.vacancyCount || 0;
                                break;
                            default:
                                break;
                        }
                    }
                });

                console.log("National Reservation Row", row);
                console.log(
                    "contractYears:",
                    position.contractYears,
                    "contractPeriod:",
                    position.contractYears ?? "-"
                );


                console.log("Position Employment Type:", position.employmentType);
                console.log("Master Employment Types:", masterData?.employmentTypes);

                const emp = masterData?.employmentTypes?.find(
                    (item) =>
                        String(item.id).trim() ===
                        String(position.employmentType).trim()
                );

                console.log("Matched Employment Type", emp);

                return row;
            })(),




            nationalOnboarded: (() => {
                const row = {
                    sc: 0,
                    st: 0,
                    obc: 0,
                    ews: 0,
                    gen: 0,

                    hi: 0,
                    oc: 0,
                    vi: 0,
                    idd: 0,

                    total: position.onboardedCount || 0,
                };

                (position.nationalBreakdown || []).forEach((cat) => {
                    if (!cat.isDisability) {
                        const code =
                            reservationMap[cat.reservationCategoryId];

                        switch (code) {
                            case "SC":
                                row.sc = cat.onboardedCount || 0;
                                break;
                            case "ST":
                                row.st = cat.onboardedCount || 0;
                                break;
                            case "OBC":
                                row.obc = cat.onboardedCount || 0;
                                break;
                            case "EWS":
                                row.ews = cat.onboardedCount || 0;
                                break;
                            case "GEN":
                                row.gen = cat.onboardedCount || 0;
                                break;
                            default:
                                break;
                        }
                    } else {
                        const code =
                            disabilityMap[cat.disabilityCategoryId];

                        switch (code) {
                            case "HI":
                                row.hi = cat.onboardedCount || 0;
                                break;
                            case "OC":
                                row.oc = cat.onboardedCount || 0;
                                break;
                            case "VI":
                                row.vi = cat.onboardedCount || 0;
                                break;
                            case "ID":
                                row.idd = cat.onboardedCount || 0;
                                break;
                            default:
                                break;
                        }
                    }
                });

                return row;
            })(),

            nationalOffersSent: (() => {
                const row = {
                    sc: 0,
                    st: 0,
                    obc: 0,
                    ews: 0,
                    gen: 0,
                    hi: 0,
                    oc: 0,
                    vi: 0,
                    idd: 0,
                    total: position.offersSent || 0,
                };

                (position.nationalBreakdown || []).forEach((cat) => {
                    if (!cat.isDisability) {
                        const code = reservationMap[cat.reservationCategoryId];

                        switch (code) {
                            case "SC": row.sc = cat.offersSent || 0; break;
                            case "ST": row.st = cat.offersSent || 0; break;
                            case "OBC": row.obc = cat.offersSent || 0; break;
                            case "EWS": row.ews = cat.offersSent || 0; break;
                            case "GEN": row.gen = cat.offersSent || 0; break;
                            default: break;
                        }
                    }
                });

                return row;
            })(),

            nationalOffersAccepted: (() => {
                const row = {
                    sc: 0,
                    st: 0,
                    obc: 0,
                    ews: 0,
                    gen: 0,
                    hi: 0,
                    oc: 0,
                    vi: 0,
                    idd: 0,
                    total: position.offersAccepted || 0,
                };

                (position.nationalBreakdown || []).forEach((cat) => {
                    if (!cat.isDisability) {
                        const code = reservationMap[cat.reservationCategoryId];

                        switch (code) {
                            case "SC": row.sc = cat.offersAccepted || 0; break;
                            case "ST": row.st = cat.offersAccepted || 0; break;
                            case "OBC": row.obc = cat.offersAccepted || 0; break;
                            case "EWS": row.ews = cat.offersAccepted || 0; break;
                            case "GEN": row.gen = cat.offersAccepted || 0; break;
                            default: break;
                        }
                    }
                });

                return row;
            })(),



            stateWiseReservation:
                (position.stateBreakdown || []).map((state) => {


                    const states =
                        masterData?.states ||
                        masterData?.data?.states ||
                        [];

                    const cities =
                        masterData?.cities ||
                        masterData?.data?.cities ||
                        [];

                    const stateMaster = states.find(
                        (s) =>
                            String(s.stateId).trim() ===
                            String(state.stateId).trim()
                    );

                    const cityMaster = cities.find(
                        (c) =>
                            String(c.cityId).trim() ===
                            String(state.cityId).trim()
                    );

                    const row = {
                        stateId: state.stateId,
                        cityId: state.cityId,

                        state: stateMaster?.stateName || "-",
                        city: cityMaster?.cityName || "-",

                        sc: 0,
                        st: 0,
                        obc: 0,
                        ews: 0,
                        gen: 0,

                        hi: 0,
                        oc: 0,
                        vi: 0,
                        idd: 0,

                        total: state.totalVacancies,
                    };

                    (state.categories || []).forEach((cat) => {
                        if (!cat.isDisability) {
                            const code =
                                reservationMap[cat.reservationCategoryId];

                            switch (code) {
                                case "SC":
                                    row.sc = cat.vacancyCount;
                                    break;
                                case "ST":
                                    row.st = cat.vacancyCount;
                                    break;
                                case "OBC":
                                    row.obc = cat.vacancyCount;
                                    break;
                                case "EWS":
                                    row.ews = cat.vacancyCount;
                                    break;
                                case "GEN":
                                    row.gen = cat.vacancyCount;
                                    break;
                                default:
                                    break;
                            }
                        } else {
                            const code =
                                disabilityMap[cat.disabilityCategoryId];

                            switch (code) {
                                case "HI":
                                    row.hi = cat.vacancyCount;
                                    break;
                                case "OC":
                                    row.oc = cat.vacancyCount;
                                    break;
                                case "VI":
                                    row.vi = cat.vacancyCount;
                                    break;
                                case "ID":
                                    row.idd = cat.vacancyCount;
                                    break;
                                default:
                                    break;
                            }
                        }
                    });

                    return row;
                }),

            stateWiseOnboarded:
                (position.stateBreakdown || []).map((state) => {

                    const stateMaster = masterData?.states?.find(
                        (s) =>
                            String(s.stateId).trim() ===
                            String(state.stateId).trim()
                    );

                    const cityMaster = masterData?.cities?.find(
                        (c) =>
                            String(c.cityId).trim() ===
                            String(state.cityId).trim()
                    );

                    const row = {
                        stateId: state.stateId,
                        cityId: state.cityId,

                        state: stateMaster?.stateName || "-",
                        city: cityMaster?.cityName || "-",

                        sc: 0,
                        st: 0,
                        obc: 0,
                        ews: 0,
                        gen: 0,

                        hi: 0,
                        oc: 0,
                        vi: 0,
                        idd: 0,

                        total: state.onboardedCount || 0,
                    };

                    (state.categories || []).forEach((cat) => {
                        if (!cat.isDisability) {
                            const code =
                                reservationMap[cat.reservationCategoryId];

                            switch (code) {
                                case "SC":
                                    row.sc = cat.onboardedCount || 0;
                                    break;
                                case "ST":
                                    row.st = cat.onboardedCount || 0;
                                    break;
                                case "OBC":
                                    row.obc = cat.onboardedCount || 0;
                                    break;
                                case "EWS":
                                    row.ews = cat.onboardedCount || 0;
                                    break;
                                case "GEN":
                                    row.gen = cat.onboardedCount || 0;
                                    break;
                                default:
                                    break;
                            }
                        } else {
                            const code =
                                disabilityMap[cat.disabilityCategoryId];

                            switch (code) {
                                case "HI":
                                    row.hi = cat.onboardedCount || 0;
                                    break;
                                case "OC":
                                    row.oc = cat.onboardedCount || 0;
                                    break;
                                case "VI":
                                    row.vi = cat.onboardedCount || 0;
                                    break;
                                case "ID":
                                    row.idd = cat.onboardedCount || 0;
                                    break;
                                default:
                                    break;
                            }
                        }
                    });

                    return row;
                }),
            stateWiseRemaining:
                (position.stateBreakdown || []).map((state) => {

                    const stateMaster = masterData?.states?.find(
                        (s) =>
                            String(s.stateId).trim() ===
                            String(state.stateId).trim()
                    );

                    const cityMaster = masterData?.cities?.find(
                        (c) =>
                            String(c.cityId).trim() ===
                            String(state.cityId).trim()
                    );

                    const row = {
                        stateId: state.stateId,
                        cityId: state.cityId,

                        state: stateMaster?.stateName || "-",
                        city: cityMaster?.cityName || "-",

                        sc: 0,
                        st: 0,
                        obc: 0,
                        ews: 0,
                        gen: 0,

                        hi: 0,
                        oc: 0,
                        vi: 0,
                        idd: 0,

                        total: state.remainingTotalVacancies || 0,
                    };

                    (state.categories || []).forEach((cat) => {
                        const value =
                            cat.remainingVacancyCount ??
                            (cat.vacancyCount || 0) - (cat.onboardedCount || 0);

                        if (!cat.isDisability) {
                            const code = reservationMap[cat.reservationCategoryId];

                            switch (code) {
                                case "SC": row.sc = value; break;
                                case "ST": row.st = value; break;
                                case "OBC": row.obc = value; break;
                                case "EWS": row.ews = value; break;
                                case "GEN": row.gen = value; break;
                                default: break;
                            }
                        } else {
                            const code = disabilityMap[cat.disabilityCategoryId];

                            switch (code) {
                                case "HI": row.hi = value; break;
                                case "OC": row.oc = value; break;
                                case "VI": row.vi = value; break;
                                case "ID": row.idd = value; break;
                                default: break;
                            }
                        }
                    });

                    return row;
                }),
            stateWiseOffersSent:
                (position.stateBreakdown || []).map((state) => {
                    const stateMaster = masterData?.states?.find(
                        (s) => String(s.stateId) === String(state.stateId)
                    );

                    const cityMaster = masterData?.cities?.find(
                        (c) => String(c.cityId) === String(state.cityId)
                    );

                    const row = {
                        state: stateMaster?.stateName || "-",
                        city: cityMaster?.cityName || "-",
                        sc: 0,
                        st: 0,
                        obc: 0,
                        ews: 0,
                        gen: 0,
                        hi: 0,
                        oc: 0,
                        vi: 0,
                        idd: 0,
                        total: state.offersSent || 0,
                    };

                    (state.categories || []).forEach((cat) => {
                        const value = cat.offersSent || 0;

                        if (!cat.isDisability) {
                            const code = reservationMap[cat.reservationCategoryId];

                            switch (code) {
                                case "SC": row.sc = value; break;
                                case "ST": row.st = value; break;
                                case "OBC": row.obc = value; break;
                                case "EWS": row.ews = value; break;
                                case "GEN": row.gen = value; break;
                                default: break;
                            }
                        }
                    });

                    return row;
                }),

            stateWiseOffersAccepted:
                (position.stateBreakdown || []).map((state) => {
                    const stateMaster = masterData?.states?.find(
                        (s) => String(s.stateId) === String(state.stateId)
                    );

                    const cityMaster = masterData?.cities?.find(
                        (c) => String(c.cityId) === String(state.cityId)
                    );

                    const row = {
                        state: stateMaster?.stateName || "-",
                        city: cityMaster?.cityName || "-",
                        sc: 0,
                        st: 0,
                        obc: 0,
                        ews: 0,
                        gen: 0,
                        hi: 0,
                        oc: 0,
                        vi: 0,
                        idd: 0,
                        total: state.offersAccepted || 0,
                    };

                    (state.categories || []).forEach((cat) => {
                        const value = cat.offersAccepted || 0;

                        if (!cat.isDisability) {
                            const code = reservationMap[cat.reservationCategoryId];

                            switch (code) {
                                case "SC": row.sc = value; break;
                                case "ST": row.st = value; break;
                                case "OBC": row.obc = value; break;
                                case "EWS": row.ews = value; break;
                                case "GEN": row.gen = value; break;
                                default: break;
                            }
                        }
                    });

                    return row;
                }),
        })),
    };
};