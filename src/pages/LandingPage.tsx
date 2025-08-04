import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, MapPin, Users, ShoppingBag, Gift, DollarSign, Camera, Eye, Store, Plus, Languages, Globe, Trash2 } from "lucide-react";
import { Link } from "react-router-dom";
import Navbar from "@/components/Navbar";
export default function LandingPage() {
  return <div className="min-h-screen bg-background">
      {/* Navigation Bar */}
      <Navbar />

      {/* Header Image Section */}
      <section className="relative h-[60vh] md:h-[70vh] lg:h-[80vh] overflow-hidden">
        <img src="/lovable-uploads/8e6c2a26-0331-4c87-b066-91363c63ef40.png" alt="Header" className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-black/20"></div>
      </section>

      {/* Hero Content Section */}
      <section className="relative py-24 px-4 overflow-hidden" style={{
      backgroundColor: '#17503a'
    }}>
        <div className="container mx-auto max-w-5xl text-center relative z-10">
          
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-impact text-rebel mb-8 animate-fade-in delay-100 drop-shadow-2xl">
            <span className="text-accent">STOOPING & THRIFTING</span>
            <br />
            <span className="text-accent">URBAN REBELLION</span>
          </h1>
          
          <p className="text-xl md:text-2xl text-accent mb-12 max-w-4xl mx-auto leading-relaxed animate-fade-in delay-200 font-impact">FIND FREE STUFF NEAR YOU –  SAVE OR MAKE MONEY – SAVE THE PLANET</p>
          
          <div className="flex flex-col sm:flex-row gap-6 justify-center animate-fade-in delay-300">
            <Button asChild size="lg" className="text-lg px-8 py-4 h-auto bg-white text-secondary hover:bg-gray-100 font-impact text-rebel shadow-rebel">
              
            </Button>
            <Button asChild variant="outline" size="lg" className="text-lg px-8 py-4 h-auto border-white text-white hover:bg-white hover:text-secondary font-impact text-rebel">
              
            </Button>
          </div>
        </div>
        
        {/* Background decoration */}
        <div className="absolute inset-0 opacity-5 bg-[#17503a]">
          <div className="absolute top-20 left-10 w-32 h-32 bg-primary rounded-full animate-pulse"></div>
          <div className="absolute bottom-20 right-10 w-24 h-24 bg-secondary rounded-full animate-pulse delay-1000"></div>
          <div className="absolute top-1/2 left-1/4 w-16 h-16 bg-accent rounded-full animate-pulse delay-500"></div>
        </div>
      </section>


      {/* Coordinates Feature - Money Making */}
      <section className="py-20 px-4 bg-background">
        <div className="container mx-auto max-w-6xl">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              
              <h2 className="text-3xl md:text-5xl font-impact text-rebel mb-8 leading-tight text-foreground">
                MAKE MONEY SHARING PHOTOS AND COORDINATES OF ABANDONED STREET FINDS
              </h2>
              <div className="space-y-6 mb-8">
                <div className="flex gap-4">
                  <Camera className="h-6 w-6 text-primary mt-1 flex-shrink-0" />
                  <p className="text-lg text-foreground font-impact">HUNT FURNITURES, ELECTRONICS OR ANY OTHER TREASURES ABANDONED ON THE STREET</p>
                </div>
                <div className="flex gap-4">
                  <MapPin className="h-6 w-6 text-primary mt-1 flex-shrink-0" />
                  <p className="text-lg text-foreground font-impact">
                    SHARE THE APPROXIMATE LOCATION AND EARN MONEY WHEN SOMEONE BUYS THE EXACT COORDINATES
                  </p>
                </div>
                <div className="flex gap-4">
                  <DollarSign className="h-6 w-6 text-primary mt-1 flex-shrink-0" />
                  <p className="text-lg text-foreground font-impact">TURN YOUR DAILY WALKS INTO AN URBAN FUN BUSINESS OPPORTUNITY</p>
                </div>
              </div>
              <Button asChild size="lg" className="bg-primary hover:bg-primary/90 font-impact text-rebel shadow-rebel">
                <Link to="/objects">
                  START MAKING MONEY AND HELPING THE PLANET <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
            </div>
            
            <div className="lg:order-first">
              <div className="p-8">
                <div className="text-center">
                  <div className="mb-6">
                    <img src="/lovable-uploads/d555150b-d59d-46cf-ad9e-2a7883671574.png" alt="Buy Coordinates" className="w-96 h-auto mx-auto" />
                  </div>
                  <h3 className="text-2xl font-impact text-rebel mb-4 text-foreground">BUY COORDINATES AND GET BARGAINS</h3>
                  <p className="text-foreground text-lg leading-relaxed font-impact">You know there is a FREE COUCH 6 away from you but not exactly where, buy the coordinates and get a €200 COUCH FOR €1</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Circular Markets Feature */}
      <section className="py-20 px-4 bg-secondary">
        <div className="container mx-auto max-w-6xl">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              {/* App Screenshots - Aligned to left */}
              <div className="space-y-8">
                <div className="w-80 max-w-sm">
                  <img 
                    src="/lovable-uploads/6596ef47-c390-485d-ad2f-866400f5dfb8.png" 
                    alt="GreenRiot app showing list of circular markets" 
                    className="w-full h-auto rounded-3xl shadow-2xl"
                  />
                </div>
                
                <div className="w-80 max-w-sm">
                  <img 
                    src="/lovable-uploads/ec64fcd2-b654-48aa-b479-6901a38d24ce.png" 
                    alt="GreenRiot app showing market details" 
                    className="w-full h-auto rounded-3xl shadow-2xl"
                  />
                </div>
              </div>
            </div>
            
            <div>
              <h2 className="text-3xl md:text-5xl font-impact text-rebel mb-8 leading-tight text-white">EXPLORE LOCAL CIRCULAR THRIFT STORES AND GARAGE SALES</h2>
              <div className="space-y-6 mb-8">
                <div className="flex gap-4">
                  <Eye className="h-6 w-6 text-primary mt-1 flex-shrink-0" />
                  <p className="text-lg text-white font-impact">BROWSE CATALOGS OF LOCAL THRIFT  STORES, GARAGE SALES AND CIRCULAR MARKETS FROM HOME. CHAT AND NEGOTIATE</p>
                </div>
                <div className="flex gap-4">
                  <MapPin className="h-6 w-6 text-primary mt-1 flex-shrink-0" />
                  <p className="text-lg text-white font-impact">VISIT ONLY THE PLACES THAT HAVE WHAT YOU'RE LOOKING FOR, SAVING TIME AND GAS</p>
                </div>
                <div className="flex gap-4">
                  <Trash2 className="h-6 w-6 text-primary mt-1 flex-shrink-0" />
                  <p className="text-lg text-white font-impact">ASK THEM TO COME TO YOUR HOUSE TO COLLECT YOUR UNWANTED ITEMS INSTEAD OF THROWING THEM IN THE TRASH</p>
                </div>
                <div className="flex gap-4">
                  <Plus className="h-6 w-6 text-primary mt-1 flex-shrink-0" />
                  <p className="text-lg text-white font-impact">CREATE YOUR OWN CIRCULAR MARKET, MAKE MONEY WITH UNWANTED STUFF AND SAVE THE PLANET</p>
                </div>
              </div>
              <Button asChild size="lg" className="bg-primary hover:bg-primary/90 font-impact text-rebel shadow-rebel">
                
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      

      {/* Footer */}
      <footer className="bg-muted py-12 px-4">
        <div className="container mx-auto max-w-6xl">
          <div className="grid md:grid-cols-2 gap-8">
            <div>
              <h3 className="text-2xl font-impact text-rebel mb-4 text-accent">GREENRIOT</h3>
              <p className="text-white mb-4 font-impact">
                THE CIRCULAR ECONOMY APP THAT TURNS YOUR FINDS INTO MONEY WHILE SAVING THE PLANET.
              </p>
              <div className="flex flex-wrap gap-2 mb-6">
                <Badge variant="outline" className="border-accent text-accent font-impact">♻️ CIRCULAR</Badge>
                <Badge variant="outline" className="border-accent text-accent font-impact">💰 PROFITABLE</Badge>
              </div>
              <div className="space-y-2">
                <Link to="/cookies" className="block hover:text-accent transition-colors font-impact text-white">
                  Cookies Policy
                </Link>
                <Link to="/privacy" className="block hover:text-accent transition-colors font-impact text-white">
                  Privacy Policy
                </Link>
                <Link to="/legal" className="block hover:text-accent transition-colors font-impact text-white">
                  Legal Notice
                </Link>
              </div>
            </div>
            
            <div>
              <h3 className="text-2xl font-impact text-rebel mb-4 text-accent">Refer and Earn</h3>
              <p className="text-white mb-4 font-impact">
                Invite your friends and earn rewards for every new user who signs up. Let's build a more sustainable and prosperous community together.
              </p>
              <div className="flex flex-wrap gap-2">
                <Badge variant="outline" className="border-accent text-accent font-impact flex items-center gap-1">
                  <DollarSign className="h-3 w-3" />
                  bring circular markets and make $
                </Badge>
                <Badge variant="outline" className="border-accent text-accent font-impact flex items-center gap-1">
                  <Globe className="h-3 w-3 text-blue-500" />
                  help the planet
                </Badge>
              </div>
            </div>
          </div>
          
          <div className="border-t border-accent mt-8 pt-8 text-center text-white">
            <p className="font-impact">MAKING LOCAL CIRCULAR ECONOMY EASY AND PROFITABLE</p>
          </div>
        </div>
      </footer>
    </div>;
}