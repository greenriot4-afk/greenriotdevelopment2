import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function CookiesPage() {
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
          <h1 className="text-4xl font-impact text-rebel mb-4">Cookie Policy</h1>
        </div>
        
        <div className="prose prose-lg max-w-none">
          <p className="text-lg mb-6">
            In compliance with Law 34/2002 of July 11, on Information Society Services and Electronic Commerce (LSSICE), we inform you that this website, Greenriot, uses cookies.
          </p>
          
          <p className="mb-6">
            LSSICE applies to any type of file or device downloaded to a user's terminal equipment for the purpose of storing data that can be updated and retrieved by the entity responsible for its installation. A cookie is one such widely used file, which we will generically refer to as cookies.
          </p>
          
          <p className="mb-6">
            Cookies are small text files sent to a browser by a web server to record a user's activity on a website, enabling the retrieval of that information later while browsing different pages connected to the server that installed them.
          </p>
          
          <p className="mb-6">
            Cookies typically store technical information, personal preferences, content customization, usage statistics, links to social networks, access to user accounts, and more.
          </p>
          
          <h2 className="text-2xl font-impact text-rebel mb-4">Types of Cookies</h2>
          <p className="mb-4">
            Below is a classification of cookies based on various criteria. Note that a single cookie may fall into multiple categories.
          </p>
          
          <h3 className="text-xl font-impact text-rebel mb-3">Based on the entity that manages them:</h3>
          <p className="mb-4">
            <strong>First-party cookies:</strong> Sent to the user's terminal from a device or domain managed by Greenriot and used to provide the requested service.
          </p>
          <p className="mb-4">
            <strong>Third-party cookies:</strong> Sent to the user's terminal from a device or domain not managed by Greenriot, but by another entity that processes the data obtained through the cookies.
          </p>
          <p className="mb-6">
            <em>Note:</em> If cookies are installed from a domain managed by Greenriot but the information is handled by a third party, they are not considered first-party cookies.
          </p>
          
          <h3 className="text-xl font-impact text-rebel mb-3">Based on the duration of activity:</h3>
          <p className="mb-4">
            <strong>Session cookies:</strong> Designed to collect and store data while the user accesses a web page. They are typically used to store information necessary for a single session.
          </p>
          <p className="mb-6">
            <strong>Persistent cookies:</strong> Data remains stored on the terminal and can be accessed and processed during a period defined by the cookie's manager — ranging from minutes to several years.
          </p>
          
          <h3 className="text-xl font-impact text-rebel mb-3">Based on their purpose:</h3>
          <p className="mb-4">
            <strong>Technical cookies:</strong> Allow navigation and use of essential functions (e.g., session management, security, multimedia playback, etc.).
          </p>
          <p className="mb-4">
            <strong>Personalization cookies:</strong> Enable access with predefined features (e.g., language, region, or browser type).
          </p>
          <p className="mb-4">
            <strong>Analytics cookies:</strong> Allow monitoring and analysis of user behavior on the site. The data collected is used to improve usability and content relevance.
          </p>
          <p className="mb-4">
            <strong>Advertising cookies:</strong> Facilitate the effective management of advertising spaces based on frequency and relevance.
          </p>
          <p className="mb-6">
            <strong>Behavioral advertising cookies:</strong> Store behavioral information gathered through continuous observation of browsing habits to deliver personalized advertising.
          </p>
          
          <h2 className="text-2xl font-impact text-rebel mb-4">How to Disable Cookies in Major Web Browsers</h2>
          <p className="mb-4">
            You can configure or disable cookie usage in your browser settings. Follow the instructions provided by each browser or refer to their help section:
          </p>
          <ul className="mb-6 list-disc pl-6">
            <li>Safari</li>
            <li>Firefox</li>
            <li>Chrome</li>
            <li>Opera</li>
            <li>Internet Explorer</li>
            <li>Microsoft Edge</li>
          </ul>
          <p className="mb-6">
            <strong>Please note:</strong> Rejecting cookies may prevent access to certain personalized content or services.
          </p>
          
          <h2 className="text-2xl font-impact text-rebel mb-4">Updates and Changes to the Cookie Policy</h2>
          <p className="mb-6">
            Greenriot may update or modify this cookie policy to comply with legal or regulatory requirements, adapt it to instructions from the Spanish Data Protection Agency, or reflect changes in the website's functionality. We recommend reviewing this policy periodically.
          </p>
          
          <h2 className="text-2xl font-impact text-rebel mb-4">Contact</h2>
          <p className="mb-4">
            If you have any questions regarding our use of cookies, you can contact us at:
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