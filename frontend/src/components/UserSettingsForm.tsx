//React core
import React, { useState } from "react";

//Third-party form validation + resolver
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

//Project schemas and types
import { SettingsFormData, settingsSchema } from "@/lib/schemas";

//UI framework components (shared design system)
import { Form } from "./ui/form";
import { Button } from "./ui/button";

//Local reusable form field component
import { CustomFormField } from "./CustomFormField";


const SettingsForm = ({
  defaultSettings: initialData,
  onSaveManagerSettings: onSubmit,
  roleType: userType,
}: SettingsFormProps) => {
  // Tracks whether inputs are editable or locked for display only
  const [isEditing, setEditMode] = useState(false);

  // Form initialization with validation and default values
  const form = useForm<SettingsFormData>({
    resolver: zodResolver(settingsSchema), // Zod schema validation
    defaultValues: initialData,            // Populates fields with API user data
  });

  // Toggles input editability and restores original values when exiting edit mode
  const toggleEditing = () => {
    setEditMode(!isEditing);
    if (isEditing) {
      form.reset(initialData); // Reverts unsaved edits
    }
  };

  // Handles validated form submission and triggers parent callback
  const handleSubmitFormData = async (data: SettingsFormData) => {
    await onSubmit(data); // Sends data to API or parent component
    setEditMode(false);   // Returns form to read-only mode
  };

  return (
    <div className="pt-8 pb-5 px-8">
      {/* Section header and description for settings page */}
      <div className="mb-5">
        <h1 className="text-xl font-semibold">
          {`${userType.charAt(0).toUpperCase() + userType.slice(1)} Settings`}
        </h1>
        <p className="text-sm text-gray-500 mt-1">
          Manage your account preferences and personal information
        </p>
      </div>

      {/* Main form container */}
      <div className="bg-white rounded-xl p-6">
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(handleSubmitFormData)} // React Hook Form submit handler
            className="space-y-6"
          >
            {/* Individual input fields using shared form component */}
            <CustomFormField name="name" label="Name" disabled={!isEditing} />

            <CustomFormField
              name="email"
              label="Email"
              type="email"
              disabled={!isEditing}
            />

            <CustomFormField
              name="phoneNumber"
              label="Phone Number"
              disabled={!isEditing}
            />

            {/* Footer actions: Edit/Cancel + Save Changes */}
            <div className="pt-4 flex justify-between">
              <Button
                type="button"
                onClick={toggleEditing}
                className="bg-secondary-500 text-white hover:bg-secondary-600"
              >
                {isEditing ? "Cancel" : "Edit"}
              </Button>

              {/* Save button appears only in edit mode */}
              {isEditing && (
                <Button
                  type="submit"
                  className="bg-primary-700 text-white hover:bg-primary-800"
                >
                  Save Changes
                </Button>
              )}
            </div>
          </form>
        </Form>
      </div>
    </div>
  );
};

export default SettingsForm;
