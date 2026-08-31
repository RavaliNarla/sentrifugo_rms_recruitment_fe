import { useState } from "react";
import jobPositionApiService from "../services/jobPositionApiService";
import { mapAddPositionToUpdateDto } from "../mappers/positionUpdate.mapper";

export const useUpdateJobPosition = () => {
  const [loading, setLoading] = useState(false);

  const updatePosition = async (payload) => {
    try {
      setLoading(true);

      if (!payload.educationData || !payload.educationData.mandatory) {
        console.error("INVALID PAYLOAD", payload);
        throw new Error("Missing educationData.mandatory");
      }

      const dto = mapAddPositionToUpdateDto(payload);

      console.log("Update Position DTO:DDDDDDDDDDDDDDDDDDDD", dto);
      let res;

      // ================================
      // 🔥 DRAFT FLOW
      // ================================
      if (payload.isDraft) {
        if (!payload.parentRequisitionId) {
          throw new Error("Missing parentRequisitionId for draft update");
        }

        if (!payload.existingPosition?.parentPositionId) {
          throw new Error("Missing parentPositionId for draft update");
        }

        res = await jobPositionApiService.updateDraftPosition({
          requisitionId: payload.parentRequisitionId,
          parentPositionId: payload.existingPosition.parentPositionId,
          dto,
          indentFile: payload.indentFile, // 🔥 REQUIRED
        });
      }

      // ================================
      // ✅ NORMAL FLOW
      // ================================
      else {
        res = await jobPositionApiService.updatePosition({
          dto,
          indentFile: payload.indentFile,
        });
      }

      // 🔥 RESPONSE CHECK
      if (!res?.success) {
        throw new Error(res?.message || "Update position failed");
      }

      return res.data;
    } catch (err) {
      console.error("Update position failed", err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return { updatePosition, loading };
};
