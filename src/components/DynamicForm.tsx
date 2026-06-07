"use client";

import Icon from "@/components/Icon";
import type { ActivityField } from "@/data/formFields";

type FormValues = Record<string, string>;

interface DynamicFormProps {
  fields: ActivityField[];
  values: FormValues;
  evidenceFileName: string;
  onChange: (fieldName: string, value: string) => void;
  onEvidenceChange: (file: File | null) => void;
}

export default function DynamicForm({
  fields,
  values,
  evidenceFileName,
  onChange,
  onEvidenceChange,
}: DynamicFormProps) {
  const baseClass =
    "w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm font-medium text-gray-900 shadow-sm outline-none transition placeholder:text-gray-400 hover:border-red-200 focus:border-red-500 focus:ring-4 focus:ring-red-50";

  return (
    <div className="space-y-8">
      <section>
        <div className="mb-5 flex items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-red-50 text-red-600">
            <Icon name="file" className="h-5 w-5" />
          </span>
          <div>
            <h3 className="text-lg font-black tracking-tight text-gray-950">
              Activity Details
            </h3>
          </div>
        </div>

        <div className="grid gap-5 md:grid-cols-2">
          {fields.map((field) => (
            <div
              key={field.name}
              className={field.fullWidth ? "md:col-span-2" : ""}
            >
              <label
                htmlFor={field.name}
                className="mb-2 block text-sm font-bold text-gray-700"
              >
                {field.label}
                {field.required ? <span className="text-red-600"> *</span> : null}
              </label>

              {field.type === "textarea" ? (
                <textarea
                  id={field.name}
                  value={values[field.name] ?? ""}
                  onChange={(event) => onChange(field.name, event.target.value)}
                  placeholder={field.placeholder ?? `Enter ${field.label}`}
                  required={field.required}
                  rows={4}
                  className={`${baseClass} resize-none leading-6`}
                />
              ) : field.type === "select" ? (
                <select
                  id={field.name}
                  value={values[field.name] ?? ""}
                  onChange={(event) => onChange(field.name, event.target.value)}
                  required={field.required}
                  className={baseClass}
                >
                  <option value="">Select {field.label}</option>
                  {field.options?.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
              ) : (
                <input
                  id={field.name}
                  type={field.type}
                  value={values[field.name] ?? ""}
                  onChange={(event) => onChange(field.name, event.target.value)}
                  placeholder={field.placeholder ?? `Enter ${field.label}`}
                  required={field.required}
                  className={baseClass}
                />
              )}
            </div>
          ))}
        </div>
      </section>

      <section className="border-t border-gray-100 pt-7">
        <div className="mb-4 flex items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-50 text-amber-600">
            <Icon name="upload" className="h-5 w-5" />
          </span>
          <div>
            <h3 className="text-lg font-black tracking-tight text-gray-950">
              Evidence
            </h3>
            <p className="text-sm text-gray-500">Certificate, order, report, photo or proof document.</p>
          </div>
        </div>

        <label
          htmlFor="evidence"
          className="flex cursor-pointer flex-col items-center justify-center rounded-2xl border border-dashed border-red-200 bg-gradient-to-br from-red-50 via-white to-white px-6 py-8 text-center transition hover:border-red-400 hover:bg-red-50"
        >
          <span className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-white text-red-600 shadow-sm">
            <Icon name="upload" className="h-5 w-5" />
          </span>
          <span className="text-sm font-black text-gray-900">
            {evidenceFileName || "Choose evidence file"}
          </span>
          <span className="mt-1 text-xs font-medium text-gray-500">
            PDF, image or document
          </span>
          <input
            id="evidence"
            type="file"
            accept=".pdf,.doc,.docx,image/*"
            onChange={(event) =>
              onEvidenceChange(event.target.files?.[0] || null)
            }
            className="sr-only"
          />
        </label>
      </section>
    </div>
  );
}
