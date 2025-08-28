import { createStore, peekAll, push, shift } from "idb-queue";
import type Project from "../components/Project";
import type { Package, Report } from "../context/projectContext";
import supabase from "./supabase";

const retentionConfig = { maxNumber: 100, batchEvictionNumber: 10 };

const withStore = createStore("simplequeue", "project", "key");
const idStore = createStore("idStore", "ids", "key");

export const pushApiCall = async (payload: {
  type: "Package" | "Project" | "Report";
  data: any;
}) => {
  await push({ key: Date.now(), value: payload }, retentionConfig, withStore);
};

export const getAll = async () => {
  const res = await peekAll(withStore);
  for (const item of res) {
    console.log({ item });
    await shiftApiCall();
  }
};

export const shiftApiCall = async () => {
  const res = await shift(1, withStore);
  if (res[0]) {
    const { value } = res[0] as { key: string; value: any };

    const { type, data } = value as {
      type: "Package" | "Project" | "Report";
      data: any;
    };

    if (type === "Project") {
      const project = (await supabase
        .from("project")
        .insert(data)
        .select()) as { data: Project[] };

      await push(
        { key: Date.now(), value: project.data[0].id },
        retentionConfig,
        idStore
      );
    }

    if (type === "Package") {
      const projectId = (await shift(1, idStore)) as [{ value: number }];

      const packageRes = (await supabase
        .from("package")
        .insert({ ...data, project_id: projectId[0].value })
        .select()) as { data: Package[] };

      await push(
        { key: Date.now(), value: packageRes.data[0].id },
        retentionConfig,
        idStore
      );
    }

    if (type === "Report") {
      const packageId = (await shift(1, idStore)) as [{ value: number }];

      (await supabase
        .from("report")
        .insert({ ...data, package_id: packageId[0].value })
        .select()) as { data: Report[] };
    }
  }
};
