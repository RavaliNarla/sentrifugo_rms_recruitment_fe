export const mapInterviewPanelsApiToUI = (list = []) => {
  return list.map((panel, index) => ({
    id: panel.interviewPanelId,
    panelName: panel.panelName,
    panelType: panel.committee?.committeeName || "-",
    centerName: panel.interviewCenter?.interviewCentre || "-",

    members:
      panel.panelMembers?.length > 0
        ? panel.panelMembers.map((m) => m.panelMember?.name).join(", ")
        : "-",

    memberIds: panel.panelMembers?.map((m) => m.panelMember?.userId) || [],
  }));
};

export const mapPanelToFormData = (panel) => {
  return {
    id: panel.interviewPanelId,
    name: panel.panelName || "",
    community: panel.committee?.interviewCommitteeId || "",
    // interviewCenterId: panel.interviewCenter?.interviewCentreId || "",
    members: panel.panelMembers?.map((m) => m.panelMember?.userId) || [],
  };
};

export const preparePanelPayload = (
  formData,
  communityOptions,
  membersOptions
  // centerOptions
) => {
  const selectedCommittee = communityOptions.find(
    (c) => c.id === formData.community
  );

  const selectedMembers = membersOptions.filter((m) =>
    formData.members.includes(m.value)
  );

  return {
    panelName: formData.name,
    description: formData.description || "",

    committee: {
      committeeName: selectedCommittee?.name || "",
      committeeDesc: "",
      interviewCommitteeId: selectedCommittee?.id,
    },

    panelMembers: selectedMembers.map((m) => ({
      panelMember: {
        userId: m.value,
        name: m.label,
        role: m.role || "",
        email: m.email || "",
      },
    })),
  };
};

export const mapPanelsApi = (list = []) => {
  return list.map((panel) => ({
    /* ===== PANEL INFO ===== */
    id: panel.interviewPanelId,
    name: panel.panelName,
    description: panel.description || "",

    /* ===== COMMITTEE INFO ===== */
    committeeId: panel.committee?.interviewCommitteeId,
    committeeName: panel.committee?.committeeName,
    committeeDesc: panel.committee?.committeeDesc || "",

    /* ===== MEMBERS (FULL OBJECTS) ===== */
    members:
      panel.panelMembers?.map((m) => ({
        panelId: panel.interviewPanelId,
        interviewPanelMemberId: m.interviewPanelMemberId,
        name: m.panelMember?.name,
        role: m.panelMember?.role,
        email: m.panelMember?.email,
        userId: m.panelMember?.userId,
      })) || [],
  }));
};
