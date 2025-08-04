import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, MapPin, Users, ShoppingBag, Gift, DollarSign, Camera, Eye, Store, Plus } from "lucide-react";
import { Link } from "react-router-dom";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-primary/20 via-background to-secondary/20 py-24 px-4 overflow-hidden">
        <div className="container mx-auto max-w-5xl text-center relative z-10">
          <Badge variant="secondary" className="mb-8 text-lg px-6 py-2 animate-fade-in">
            🌍 CIRCULAR ECONOMY MADE EASY
          </Badge>
          
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-black mb-8 animate-fade-in delay-100">
            <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              STOOPING & THRIFTING
            </span>
            <br />
            <span className="text-foreground">APP</span>
          </h1>
          
          <p className="text-xl md:text-2xl text-muted-foreground mb-12 max-w-4xl mx-auto leading-relaxed animate-fade-in delay-200">
            <span className="font-semibold text-primary">FIND FREE STUFF NEAR YOU</span> – give it a second life – 
            <span className="font-semibold text-secondary"> SAVE OR MAKE MONEY</span> – help the planet
          </p>
          
          <div className="flex flex-col sm:flex-row gap-6 justify-center animate-fade-in delay-300">
            <Button asChild size="lg" className="text-lg px-8 py-4 h-auto">
              <Link to="/auth">
                Start Finding Free Stuff <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="text-lg px-8 py-4 h-auto">
              <Link to="/abandons">
                Explore Now
              </Link>
            </Button>
          </div>
        </div>
        
        {/* Background decoration */}
        <div className="absolute inset-0 opacity-5">
          <div className="absolute top-20 left-10 w-32 h-32 bg-primary rounded-full animate-pulse"></div>
          <div className="absolute bottom-20 right-10 w-24 h-24 bg-secondary rounded-full animate-pulse delay-1000"></div>
          <div className="absolute top-1/2 left-1/4 w-16 h-16 bg-accent rounded-full animate-pulse delay-500"></div>
        </div>
      </section>

      {/* Coordinates Feature - Money Making */}
      <section className="py-20 px-4 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-950/20 dark:to-emerald-950/20">
        <div className="container mx-auto max-w-6xl">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <Badge className="mb-6 bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300">
                💰 MAKE MONEY
              </Badge>
              <h2 className="text-3xl md:text-5xl font-bold mb-8 leading-tight">
                <span className="text-green-600 dark:text-green-400">MAKE MONEY</span> SHARING PHOTOS AND COORDINATES 
                <br />OF ABANDONED STREET FINDS
              </h2>
              <div className="space-y-6 mb-8">
                <div className="flex gap-4">
                  <Camera className="h-6 w-6 text-green-600 dark:text-green-400 mt-1 flex-shrink-0" />
                  <p className="text-lg text-muted-foreground">
                    Snap a photo of abandoned furniture, electronics, or valuables you find on the street
                  </p>
                </div>
                <div className="flex gap-4">
                  <MapPin className="h-6 w-6 text-green-600 dark:text-green-400 mt-1 flex-shrink-0" />
                  <p className="text-lg text-muted-foreground">
                    Share the approximate location and earn money when someone buys the exact coordinates
                  </p>
                </div>
                <div className="flex gap-4">
                  <DollarSign className="h-6 w-6 text-green-600 dark:text-green-400 mt-1 flex-shrink-0" />
                  <p className="text-lg text-muted-foreground">
                    Turn your daily walks into a money-making opportunity while helping others find treasures
                  </p>
                </div>
              </div>
              <Button asChild size="lg" className="bg-green-600 hover:bg-green-700">
                <Link to="/auth">
                  Start Making Money <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
            </div>
            
            <div className="lg:order-first">
              <Card className="p-8 bg-white/80 dark:bg-card/80 backdrop-blur border-green-200 dark:border-green-800">
                <div className="text-center">
                  <div className="bg-green-100 dark:bg-green-900/50 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-6">
                    <Eye className="h-10 w-10 text-green-600 dark:text-green-400" />
                  </div>
                  <h3 className="text-2xl font-bold mb-4">BUY COORDINATES AND GET BARGAINS</h3>
                  <p className="text-muted-foreground text-lg leading-relaxed">
                    You know a <span className="font-semibold text-primary">FREE COUCH</span> is 6.8 miles away from you but not exactly where, 
                    <span className="font-semibold text-green-600 dark:text-green-400"> buy the coordinates</span> and get a 
                    <span className="font-semibold text-primary"> $200 COUCH for $1</span>
                  </p>
                </div>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Circular Markets Feature */}
      <section className="py-20 px-4">
        <div className="container mx-auto max-w-6xl">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <Card className="p-8 bg-gradient-to-br from-purple-50 to-blue-50 dark:from-purple-950/20 dark:to-blue-950/20 border-purple-200 dark:border-purple-800">
                <div className="text-center">
                  <div className="bg-purple-100 dark:bg-purple-900/50 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-6">
                    <Store className="h-10 w-10 text-purple-600 dark:text-purple-400" />
                  </div>
                  <h3 className="text-2xl font-bold mb-4">EXPLORE LOCAL CIRCULAR THRIFT STORES</h3>
                  <p className="text-muted-foreground text-lg leading-relaxed">
                    <span className="font-semibold text-purple-600 dark:text-purple-400">SEE THEIR CATALOG FROM THE COMFORT OF YOUR HOME</span> 
                    <br />AND THEN GO TO BUY LIVE
                  </p>
                </div>
              </Card>
            </div>
            
            <div>
              <Badge className="mb-6 bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300">
                🏪 CIRCULAR MARKETS
              </Badge>
              <h2 className="text-3xl md:text-5xl font-bold mb-8 leading-tight">
                EXPLORE LOCAL CIRCULAR THRIFT STORES OR GARAGE SALES
              </h2>
              <div className="space-y-6 mb-8">
                <div className="flex gap-4">
                  <Eye className="h-6 w-6 text-purple-600 dark:text-purple-400 mt-1 flex-shrink-0" />
                  <p className="text-lg text-muted-foreground">
                    Browse catalogs of local thrift stores, garage sales, and circular markets from home
                  </p>
                </div>
                <div className="flex gap-4">
                  <MapPin className="h-6 w-6 text-purple-600 dark:text-purple-400 mt-1 flex-shrink-0" />
                  <p className="text-lg text-muted-foreground">
                    Visit only the stores that have what you're looking for, saving time and gas
                  </p>
                </div>
                <div className="flex gap-4">
                  <Plus className="h-6 w-6 text-purple-600 dark:text-purple-400 mt-1 flex-shrink-0" />
                  <p className="text-lg text-muted-foreground">
                    <span className="font-semibold">CREATE YOUR OWN CIRCULAR MARKET,</span> make money with unwanted stuff and save the planet
                  </p>
                </div>
              </div>
              <Button asChild size="lg" className="bg-purple-600 hover:bg-purple-700">
                <Link to="/markets">
                  Explore Markets <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-20 px-4 bg-gradient-to-r from-primary to-secondary text-primary-foreground">
        <div className="container mx-auto max-w-4xl text-center">
          <h2 className="text-3xl md:text-5xl font-bold mb-6">
            Ready to Turn Trash into Cash?
          </h2>
          <p className="text-xl mb-12 opacity-90 max-w-2xl mx-auto">
            Join thousands of users who are already making money, saving money, and helping the planet through circular economy.
          </p>
          <div className="flex flex-col sm:flex-row gap-6 justify-center">
            <Button asChild size="lg" variant="secondary" className="text-lg px-8 py-4 h-auto">
              <Link to="/auth">
                Join Free Now
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="border-primary-foreground text-primary-foreground hover:bg-primary-foreground hover:text-primary text-lg px-8 py-4 h-auto">
              <Link to="/abandons">
                Start Exploring
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-muted py-12 px-4">
        <div className="container mx-auto max-w-6xl">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <h3 className="text-2xl font-bold mb-4">Greenriot</h3>
              <p className="text-muted-foreground mb-4">
                The circular economy app that turns your finds into cash while saving the planet.
              </p>
              <div className="flex space-x-4">
                <Badge variant="outline">♻️ Circular</Badge>
                <Badge variant="outline">💰 Profitable</Badge>
              </div>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Features</h4>
              <ul className="space-y-2 text-muted-foreground">
                <li><Link to="/abandons" className="hover:text-foreground transition-colors">Find Free Stuff</Link></li>
                <li><Link to="/markets" className="hover:text-foreground transition-colors">Circular Markets</Link></li>
                <li><Link to="/wallet" className="hover:text-foreground transition-colors">Earnings</Link></li>
                <li><Link to="/affiliate" className="hover:text-foreground transition-colors">Refer & Earn</Link></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Community</h4>
              <ul className="space-y-2 text-muted-foreground">
                <li><Link to="/chat" className="hover:text-foreground transition-colors">Chat</Link></li>
                <li><Link to="/favorites" className="hover:text-foreground transition-colors">Favorites</Link></li>
                <li><Link to="/account" className="hover:text-foreground transition-colors">My Account</Link></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Impact</h4>
              <ul className="space-y-2 text-muted-foreground">
                <li>50k+ active users</li>
                <li>85% waste reduction</li>
                <li>€500 average savings</li>
                <li>Growing community</li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-border mt-8 pt-8 text-center text-muted-foreground">
            <p>&copy; 2024 Greenriot. All rights reserved. Making circular economy profitable.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}