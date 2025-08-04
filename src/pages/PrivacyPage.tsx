import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function PrivacyPage() {
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
          <h1 className="text-4xl font-impact text-rebel mb-4">Privacy Policy</h1>
        </div>
        
        <div className="prose prose-lg max-w-none">
          <h2 className="text-2xl font-impact text-rebel mb-4">Introduction</h2>
          <p className="text-lg mb-6">
            At Greenriot Corporation C, we are highly attuned to the needs of Internet users and fully aware of the importance of maintaining the strict privacy of the personal information entrusted to us. This privacy statement is provided to inform you about our policy regarding the handling of personal data obtained from our visitors and users.
          </p>
          
          <p className="mb-6">
            By merely reading, viewing, or browsing this site, you accept these terms. If you do not agree to them, you must leave the site without using it or its content and without accessing any linked pages.
          </p>
          
          <p className="mb-6">
            <strong>Please note:</strong> This website is purely informative. The collection and processing of personal data occurs exclusively within the Greenriot mobile application, which operates as the core platform for our services.
          </p>
          
          <h2 className="text-2xl font-impact text-rebel mb-4">Data Controller</h2>
          <p className="mb-6">
            The owner of this site and the data controller is Greenriot Corporation C, with Tax ID (EIN) 36-5060375. You may contact us via email at contact@greenriot.org or by postal mail at 4751 Luminous Loop, postal code 34746, Kissimmee, FL, US.
          </p>
          
          <h2 className="text-2xl font-impact text-rebel mb-4">Purpose of Data Processing</h2>
          <p className="mb-4">
            On our websites, there are specific sections where you can provide your data to receive updates about our site and some of the programs we distribute. We assure you that the information you provide will be handled with complete confidentiality.
          </p>
          <p className="mb-4">
            Data will be stored as long as there is a foreseeable need for its use for the purpose it was collected.
          </p>
          <p className="mb-4">
            No automated decisions are made with your data.
          </p>
          <p className="mb-6">
            The website may use cookies; please refer to our cookie policy.
          </p>
          
          <h2 className="text-2xl font-impact text-rebel mb-4">Legal Basis for Data Processing</h2>
          <p className="mb-6">
            Your data is processed because you give us your consent by providing it through the forms for the specific uses indicated in each case. Your data is only necessary for the specific purposes requested, and if you do not provide it, those services cannot be offered.
          </p>
          
          <h2 className="text-2xl font-impact text-rebel mb-4">Data Transfers and Sharing</h2>
          <p className="mb-4">
            We are firmly committed to ensuring that any data you provide to Greenriot Corporation C will not be sold or shared with third parties without your prior consent under any circumstances, except with explicit consent or legal obligation.
          </p>
          <p className="mb-6">
            Our website contains links to third-party websites. Greenriot Corporation C is not responsible for the privacy policies and practices of these external sites.
          </p>
          
          <h2 className="text-2xl font-impact text-rebel mb-4">Data Subject Rights</h2>
          <p className="mb-6">
            You have the right to access the information stored about you in our databases, correct any inaccuracies, delete it, limit its processing, object to its use, and withdraw your consent if you so desire. To exercise these rights, simply email us at contact@greenriot.org, and we will gladly address any questions, comments, or clarifications you may require.
          </p>
          
          <h2 className="text-2xl font-impact text-rebel mb-4">Mobile App Privacy Policy</h2>
          <p className="mb-4">
            This privacy policy applies to the Greenriot app (hereby referred to as "Application") for mobile devices that was created by Greenriot Corporation C (hereby referred to as "Service Provider") as an Ad Supported service. This service is intended for use "AS IS".
          </p>
          <p className="mb-6">
            This Application complies with the data protection and security requirements of applicable European legislation, as well as the General Data Protection Regulation (GDPR).
          </p>
          
          <h3 className="text-xl font-impact text-rebel mb-3">Information Collection and Use</h3>
          <p className="mb-4">
            The Application collects information when you download and use it. This information may include:
          </p>
          <ul className="mb-4 list-disc pl-6">
            <li>Your device's Internet Protocol address (e.g. IP address)</li>
            <li>The pages of the Application that you visit, the time and date of your visit, the time spent on those pages</li>
            <li>The operating system you use on your mobile device</li>
          </ul>
          <p className="mb-4">
            The Application does not collect precise geolocation data, but may use approximate location data based on the device's general network access, with your consent.
          </p>
          <p className="mb-4">
            Location information is used for:
          </p>
          <ul className="mb-4 list-disc pl-6">
            <li><strong>Geolocation Services:</strong> To provide features such as relevant recommendations and location-based content.</li>
            <li><strong>Analytics and Improvements:</strong> To understand behavior and improve the app experience (always anonymized and aggregated).</li>
            <li><strong>Third-Party Services:</strong> Occasionally, anonymized location data may be shared with third parties to enhance the app's functionality.</li>
          </ul>
          <p className="mb-6">
            For a better experience, the Service Provider may require you to provide certain personally identifiable information, such as email, user ID, and nickname. This information is retained and used only as described in this policy.
          </p>
          
          <h3 className="text-xl font-impact text-rebel mb-3">Third Party Access</h3>
          <p className="mb-4">
            Only aggregated, anonymized data is periodically transmitted to external services to aid Greenriot Corporation C in improving the Application and its service. Your information may be shared in these cases:
          </p>
          <ul className="mb-6 list-disc pl-6">
            <li>When required by law (e.g., subpoena or legal process)</li>
            <li>When necessary to protect rights, safety, or comply with government requests</li>
            <li>With trusted third-party service providers who act on our behalf under strict confidentiality terms</li>
          </ul>
          
          <h3 className="text-xl font-impact text-rebel mb-3">Opt-Out Rights</h3>
          <p className="mb-6">
            You can stop all collection of information by the Application by uninstalling it. Use your device's standard uninstall process or remove it through your mobile app store.
          </p>
          
          <h3 className="text-xl font-impact text-rebel mb-3">Data Retention Policy</h3>
          <p className="mb-6">
            Greenriot Corporation C will retain user-provided data for as long as you use the Application and for a reasonable time thereafter. If you wish to delete data provided via the Application, please contact us at contact@greenriot.org and we will respond promptly.
          </p>
          
          <h3 className="text-xl font-impact text-rebel mb-3">Children</h3>
          <p className="mb-4">
            The Application does not knowingly collect personal data from children under 13 years of age. In accordance with applicable laws:
          </p>
          <ul className="mb-4 list-disc pl-6">
            <li>Users must be at least 13 years old in the United States, or 16 in the EU, unless a parent or guardian consents on their behalf.</li>
            <li>If we become aware that we have inadvertently received data from a child without parental consent, we will delete such information immediately.</li>
          </ul>
          
          <h3 className="text-xl font-impact text-rebel mb-3">Security</h3>
          <p className="mb-6">
            Greenriot Corporation C is committed to protecting your data. We implement physical, electronic, and procedural safeguards to secure the information we process.
          </p>
          
          <h3 className="text-xl font-impact text-rebel mb-3">Changes</h3>
          <p className="mb-6">
            This Privacy Policy may be updated from time to time. Any changes will be reflected on this page. Continued use of the Application after changes implies acceptance of the updated terms.
          </p>
          
          <p className="mb-6">
            <strong>Effective date:</strong> 2025-04-30
          </p>
          
          <h3 className="text-xl font-impact text-rebel mb-3">Your Consent</h3>
          <p className="mb-6">
            By using the Application, you consent to the processing of your information as described in this policy and any updates published here.
          </p>
          
          <h3 className="text-xl font-impact text-rebel mb-3">Contact Us</h3>
          <p className="mb-4">
            For questions regarding this Privacy Policy or your data, please contact us at:
          </p>
          <p className="mb-4">
            📧 contact@greenriot.org
          </p>
          
          <p className="text-sm text-muted-foreground mt-8">
            Última actualización: {new Date().toLocaleDateString()}
          </p>
        </div>
      </div>
    </div>
  );
}