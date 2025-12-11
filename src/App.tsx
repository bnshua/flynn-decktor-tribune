import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import Admin from "./pages/Admin";
import Games from "./pages/Games";
import Wordle from "./pages/Wordle";
import Connections from "./pages/Connections";
import MiniCrossword from "./pages/MiniCrossword";
import Crossword from "./pages/Crossword";
import SpellingBee from "./pages/SpellingBee";
import ComicArchive from "./pages/ComicArchive";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/admin" element={<Admin />} />
          <Route path="/games" element={<Games />} />
          <Route path="/games/wordle" element={<Wordle />} />
          <Route path="/games/connections" element={<Connections />} />
          <Route path="/games/mini-crossword" element={<MiniCrossword />} />
          <Route path="/games/crossword" element={<Crossword />} />
          <Route path="/games/spelling-bee" element={<SpellingBee />} />
          <Route path="/comic-archive" element={<ComicArchive />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
