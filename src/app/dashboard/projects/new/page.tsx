import { NewProjectForm } from "@/components/onboarding/new-project-form";

export default function NewProjectPage() {
  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold">New project</h1>
        <p className="text-[#6B7280] mt-1">
          Tell us about your project and we'll assess its planning prospects.
        </p>
      </div>
      <NewProjectForm />
    </div>
  );
}
