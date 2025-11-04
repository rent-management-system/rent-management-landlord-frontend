import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

const Index = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 flex items-center justify-center bg-background">
        <div className="text-center px-4">
          <h1 className="mb-4 text-4xl md:text-5xl font-bold">Welcome to Rental Management System</h1>
          <p className="text-xl text-muted-foreground mb-8">Choose your role to get started</p>
          <div className="flex gap-4 justify-center">
            <Button size="lg" onClick={() => navigate('/landlord')}>
              I'm a Landlord
            </Button>
            <Button size="lg" variant="outline">
              I'm a Tenant
            </Button>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Index;
