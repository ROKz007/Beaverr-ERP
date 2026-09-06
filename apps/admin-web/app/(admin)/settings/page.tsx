"use client";

import { useEffect, useState } from "react";
import { Card } from "@repo/ui/card";
import { Button } from "@repo/ui/button";
import { Input } from "@repo/ui/input";
import { Label } from "@repo/ui/label";
import type { Society, Department } from "@repo/types";
import { api } from "../../../lib/api";
import { DataTable, type Column } from "../../../components/DataTable";

export default function SettingsPage() {
  const [society, setSociety] = useState<Society | null>(null);
  const [name, setName] = useState("");
  const [address, setAddress] = useState("");
  const [profileSaved, setProfileSaved] = useState(false);

  const [departments, setDepartments] = useState<Department[]>([]);
  const [showDeptForm, setShowDeptForm] = useState(false);
  const [deptName, setDeptName] = useState("");
  const [deptContact, setDeptContact] = useState("");
  const [deptPhone, setDeptPhone] = useState("");

  async function load() {
    const [profileRes, deptRes] = await Promise.all([
      api.get("/api/society/profile"),
      api.get("/api/society/departments"),
    ]);
    setSociety(profileRes.data.data);
    setName(profileRes.data.data.name);
    setAddress(profileRes.data.data.address);
    setDepartments(deptRes.data.data);
  }

  useEffect(() => {
    load();
  }, []);

  async function saveProfile(e: React.FormEvent) {
    e.preventDefault();
    const { data } = await api.patch("/api/society/profile", { name, address });
    setSociety(data.data);
    setProfileSaved(true);
    setTimeout(() => setProfileSaved(false), 2000);
  }

  async function toggleGateModule() {
    if (!society) return;
    const { data } = await api.patch("/api/society/gate-module", { isRestrictedEntry: !society.isRestrictedEntry });
    setSociety(data.data);
  }

  async function addDepartment(e: React.FormEvent) {
    e.preventDefault();
    await api.post("/api/society/departments", {
      name: deptName,
      contactName: deptContact || undefined,
      phone: deptPhone || undefined,
    });
    setDeptName("");
    setDeptContact("");
    setDeptPhone("");
    setShowDeptForm(false);
    load();
  }

  async function removeDepartment(id: string) {
    await api.delete(`/api/society/departments/${id}`);
    load();
  }

  const columns: Column<Department>[] = [
    { key: "name", label: "Department" },
    { key: "contactName", label: "Contact", render: (d) => d.contactName ?? "—" },
    { key: "phone", label: "Phone", render: (d) => d.phone ?? "—" },
    {
      key: "actions",
      label: "",
      render: (d) => (
        <button onClick={() => removeDepartment(d.id)} className="text-xs text-destructive hover:underline">
          Remove
        </button>
      ),
    },
  ];

  if (!society) return <p className="text-sm text-white/50">Loading…</p>;

  return (
    <div className="flex flex-col gap-8">
      <div>
        <span className="rounded-full bg-white/[0.06] px-3 py-1 text-[10px] font-medium uppercase tracking-[0.2em] text-white/50">
          Settings
        </span>
        <h1 className="mt-3 font-heading text-2xl font-semibold text-white">Society settings</h1>
      </div>

      <Card>
        <form onSubmit={saveProfile} className="flex flex-col gap-4 p-6">
          <p className="text-sm font-medium text-white">Profile</p>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="name">Society name</Label>
              <Input id="name" value={name} onChange={(e) => setName(e.target.value)} required />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="code">Society code</Label>
              <Input id="code" value={society.code} disabled />
            </div>
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="address">Address</Label>
            <Input id="address" value={address} onChange={(e) => setAddress(e.target.value)} required />
          </div>
          <div className="flex items-center gap-3">
            <Button type="submit" className="w-fit">
              Save
            </Button>
            {profileSaved && <span className="text-xs text-success">Saved.</span>}
          </div>
        </form>
      </Card>

      <Card>
        <div className="flex items-center justify-between p-6">
          <div>
            <p className="text-sm font-medium text-white">Gate Console (restricted entry)</p>
            <p className="mt-1 text-xs text-white/50">
              When on, all visitors must be pre-approved or logged by a guard at the gate.
            </p>
          </div>
          <button
            onClick={toggleGateModule}
            className={society.isRestrictedEntry ? "text-success" : "text-white/40"}
          >
            {society.isRestrictedEntry ? "Enabled" : "Disabled"}
          </button>
        </div>
      </Card>

      <div className="flex items-center justify-between">
        <p className="text-sm font-medium text-white">Departments</p>
        <Button onClick={() => setShowDeptForm((v) => !v)}>{showDeptForm ? "Cancel" : "Add department"}</Button>
      </div>

      {showDeptForm && (
        <Card>
          <form onSubmit={addDepartment} className="flex flex-col gap-4 p-6">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="deptName">Name</Label>
                <Input id="deptName" value={deptName} onChange={(e) => setDeptName(e.target.value)} required />
              </div>
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="deptContact">Contact person</Label>
                <Input id="deptContact" value={deptContact} onChange={(e) => setDeptContact(e.target.value)} />
              </div>
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="deptPhone">Phone</Label>
                <Input id="deptPhone" value={deptPhone} onChange={(e) => setDeptPhone(e.target.value)} />
              </div>
            </div>
            <Button type="submit" className="w-fit">
              Save department
            </Button>
          </form>
        </Card>
      )}

      <Card>
        <DataTable columns={columns} rows={departments} emptyMessage="No departments yet." />
      </Card>
    </div>
  );
}
