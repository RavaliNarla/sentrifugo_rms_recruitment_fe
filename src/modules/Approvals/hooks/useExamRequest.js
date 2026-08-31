import { useCallback, useState } from "react";
import { toast } from "react-toastify";
import committeeManagementService from "../../committeeManagement/services/committeeManagementService";
import masterApiService from "../../master/services/masterApiService";

const useExamRequest = () => {
  const [requisitionOptions, setRequisitionOptions] = useState([]);
  const [examConfigList, setExamConfigList] = useState([]);
  const [workflowHistory, setWorkflowHistory] = useState([]);

  const [loadingRequisitions, setLoadingRequisitions] = useState(false);
  const [loadingExamConfigs, setLoadingExamConfigs] = useState(false);
  const [loadingWorkflowHistory, setLoadingWorkflowHistory] = useState(false);

  const [users, setUsers] = useState([]);
  const [loadingUsers, setLoadingUsers] = useState(false);

  const fetchRequisitions = useCallback(async () => {
    try {
      setLoadingRequisitions(true);

      const res = await committeeManagementService.getRequisitions();
      const data = res?.data || [];

      setRequisitionOptions(
        data.map((req) => ({
          label: `${req.requisitionCode} - ${req.requisitionTitle}`,
          value: req.id,
          raw: req,
        }))
      );
    } catch (error) {
      toast.error("Failed to load requisitions");
      setRequisitionOptions([]);
    } finally {
      setLoadingRequisitions(false);
    }
  }, []);

  const fetchExamConfigList = useCallback(async (requisitionId) => {
    try {
      setLoadingExamConfigs(true);

      const res =
        await committeeManagementService.getExamConfigList(requisitionId);
      const data = res?.data || [];

      setExamConfigList(data);
      return data;
    } catch (error) {
      toast.error("Failed to load exam configurations");
      setExamConfigList([]);
      return [];
    } finally {
      setLoadingExamConfigs(false);
    }
  }, []);

  const fetchWorkflowHistory = useCallback(async (examConfigId) => {
    try {
      setLoadingWorkflowHistory(true);

      const res =
        await committeeManagementService.getWorkflowHistory(examConfigId);
      const data = res?.data || [];

      setWorkflowHistory(data);
      return data;
    } catch (error) {
      toast.error("Failed to load workflow history");
      setWorkflowHistory([]);
      return [];
    } finally {
      setLoadingWorkflowHistory(false);
    }
  }, []);

  const fetchUsers = useCallback(async () => {
    try {
      setLoadingUsers(true);

      const res = await masterApiService.getUser();

      const data = Object.values(res?.data || {});

      setUsers(data);

      return data;
    } catch (error) {
      toast.error("Failed to load users");

      setUsers([]);

      return [];
    } finally {
      setLoadingUsers(false);
    }
  }, []);

  return {
    requisitionOptions,
    examConfigList,
    workflowHistory,
    loadingRequisitions,
    loadingExamConfigs,
    loadingWorkflowHistory,
    fetchRequisitions,
    fetchExamConfigList,
    fetchWorkflowHistory,
    setExamConfigList,
    setWorkflowHistory,
    users,
    loadingUsers,
    fetchUsers,
  };
};

export default useExamRequest;
