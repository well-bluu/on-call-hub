import AccountSettings from "@/components/accountSettings";
import DocumentsCard from "@/components/documentsCard";
import EmergencyCard from "@/components/emergencyCard";
import PersonalInformationCard from "@/components/personalInformationCard";
import WorkerSummary from "@/components/workerSummary";

export default function ProtectedPage() {
  return (
    <div className=" flex flex-col gap-6">
      <div className="flex flex-row flex-1 gap-10 mt-8">
        <div className="flex flex-col flex-1 gap-3">
          <PersonalInformationCard
            fullName={"Full Name"}
            dateOfBirth={"Date of Birth"}
            gender={"Male"}
            phoneNumber={"0922 ayg tuo"}
            emailAddress={"example@gmail.com"}
            address={"Balay ni Adi"}
          />
          <DocumentsCard
            NBI={"NBI"}
            medCert={"Med Cert"}
            philHealth={"Phil Health"}
          />
        </div>
        <div className="flex flex-col gap-3">
          <EmergencyCard name={"Kotaro Jujo"} number={"0922 ayg tuo"} />
          <WorkerSummary />
          <AccountSettings />
        </div>
      </div>
    </div>
  );
}
