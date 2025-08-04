import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function LegalPage() {
  return (
    <div className="min-h-screen bg-background p-4">
      <div className="container mx-auto max-w-4xl">
        <div className="mb-8">
          <Button asChild variant="ghost" className="mb-4">
            <Link to="/" className="flex items-center gap-2">
              <ArrowLeft className="h-4 w-4" />
              Volver al inicio
            </Link>
          </Button>
          <h1 className="text-4xl font-impact text-rebel mb-4">Legal Notice</h1>
        </div>
        
        <div className="prose prose-lg max-w-none">
          <h2 className="text-2xl font-impact text-rebel mb-4">Identification Data of the Website Owner</h2>
          <p className="text-lg mb-6">
            In compliance with the duty of information stipulated in Article 10 of Law 34/2002 of July 11 on Information Society Services and Electronic Commerce, Greenriot Corporation C, with Tax ID (DNI) 36-5060375, hereinafter referred to as Greenriot, as the owner of the website greenriot.org, with registered address at 4751 Luminous Loop, 34746, Kissimmee, FL, USA, and email address contact@greenriot.org, hereby provides the following legal notice which defines and regulates the terms of use of this website, the limitations of liability, and the obligations that users of the domain greenriot.org agree to respect.
          </p>
          
          <h2 className="text-2xl font-impact text-rebel mb-4">Terms of Use</h2>
          <p className="mb-4">
            Use of greenriot.org confers the status of User of the website, whether an individual or legal entity, and necessarily implies full, unreserved acceptance of all clauses and general conditions contained in this Legal Notice. If the User does not agree with these terms, they must refrain from using greenriot.org.
          </p>
          <p className="mb-4">
            This Legal Notice may be updated and modified over time. Therefore, the version published by Greenriot may differ each time the User accesses the website. Users are encouraged to review this Legal Notice regularly.
          </p>
          <p className="mb-6">
            Through greenriot.org, Greenriot provides Users with general information about the company, its mission, and services related to its mobile app platform. The website is purely informational and does not host any transactional functionalities. All commercial services are exclusively provided through Greenriot's mobile application, available on official app stores.
          </p>
          
          <h2 className="text-2xl font-impact text-rebel mb-4">Intellectual Property</h2>
          <p className="mb-4">
            All trademarks, trade names, or distinctive signs appearing on greenriot.org are the property of Greenriot or their respective owners. Access to the website does not grant Users any rights over such elements.
          </p>
          <p className="mb-6">
            The content of greenriot.org (including but not limited to text, images, logos, and design) is the intellectual property of Greenriot or licensed third parties. Unauthorized use of any content or infringement of the Intellectual or Industrial Property rights will result in legal liability.
          </p>
          
          <h2 className="text-2xl font-impact text-rebel mb-4">Availability of Greenriot.org</h2>
          <p className="mb-4">
            Greenriot does not guarantee uninterrupted or error-free access to greenriot.org, nor does it ensure that the content is always up to date. The company will take all reasonable measures to avoid, correct, or update any such issues where possible.
          </p>
          <p className="mb-6">
            Hyperlinks to other websites are provided for informational purposes only. Their presence does not imply any recommendation or endorsement. Greenriot accepts no responsibility for the content of linked websites or the results that may arise from accessing them, nor does it guarantee they are free from viruses or harmful components.
          </p>
          
          <h2 className="text-2xl font-impact text-rebel mb-4">Quality of Greenriot.org</h2>
          <p className="mb-6">
            Due to the dynamic nature of the information, Greenriot does not guarantee the complete accuracy, reliability, or currency of the content published on greenriot.org. All information is provided for general guidance and has no binding contractual nature.
          </p>
          
          <h2 className="text-2xl font-impact text-rebel mb-4">Limitation of Liability</h2>
          <p className="mb-4">
            Greenriot is not responsible for any decisions made by the User based on the information contained on this website, nor for any typographical errors that documents or graphics may contain.
          </p>
          <p className="mb-6">
            Users understand and accept that greenriot.org is an informational website and that all transactional and data-handling activities occur exclusively through the Greenriot mobile application.
          </p>
          
          <h2 className="text-2xl font-impact text-rebel mb-4">Business Model and Payments Disclaimer</h2>
          <p className="mb-4">
            Greenriot.org provides a platform that facilitates peer-to-peer transactions for the exchange of location data (coordinates) related to valuable items discarded on the street. These coordinates are user-generated and represent physical items that may be freely collected by those who travel to the specified location.
          </p>
          <p className="mb-4">
            Greenriot.org and its mobile applications do not act as a bank, financial institution, or escrow service. We do not offer financial services, hold user funds, or provide loans, interest-bearing accounts, or investment instruments.
          </p>
          <p className="mb-4">
            Transactions between users are processed via third-party payment providers, such as Stripe. Greenriot.org only facilitates the technical infrastructure for the discovery, posting, and acquisition of coordinates. Users are solely responsible for the legality, accuracy, and usefulness of the content they provide or purchase.
          </p>
          <p className="mb-4">
            Greenriot.org retains a service fee (currently 20%) on each successful transaction. The remaining balance is disbursed to the user who shared the coordinates via the external payment system.
          </p>
          <p className="mb-6">
            By using this service, users acknowledge and agree that all purchases made on the platform are for access to real-world location data for physical, offline use, and that no digital goods, subscriptions, or premium features are sold within the app or on the website.
          </p>
          
          <h2 className="text-2xl font-impact text-rebel mb-4">Notifications</h2>
          <p className="mb-6">
            All communications and notifications made by Greenriot to Users by any means will be considered effective for all purposes.
          </p>
          
          <h2 className="text-2xl font-impact text-rebel mb-4">Applicable Law</h2>
          <p className="mb-4">
            This Legal Notice is governed by the laws of the State of Florida, USA.
          </p>
          
          <p className="text-sm text-muted-foreground mt-8">
            Última actualización: {new Date().toLocaleDateString()}
          </p>
        </div>
      </div>
    </div>
  );
}