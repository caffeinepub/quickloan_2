import { Zap } from "lucide-react";
import { SiFacebook, SiInstagram, SiX } from "react-icons/si";

export default function Footer() {
  const year = new Date().getFullYear();
  const utmLink = `https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(window.location.hostname)}`;

  return (
    <footer className="bg-muted/40 border-t border-border pt-12 pb-6">
      <div className="container mx-auto max-w-6xl px-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-10">
          <div>
            <div className="flex items-center gap-2 font-bold text-lg text-primary mb-3">
              <div className="w-7 h-7 rounded-lg bg-primary flex items-center justify-center">
                <Zap className="w-3.5 h-3.5 text-white" />
              </div>
              FinFlow
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Fast personal loans from ₹1,000 to ₹5,000 for salaried &amp;
              self-employed individuals.
            </p>
            <div className="flex gap-3 mt-4">
              <span className="text-muted-foreground cursor-pointer hover:text-primary transition-colors">
                <SiFacebook size={18} />
              </span>
              <span className="text-muted-foreground cursor-pointer hover:text-primary transition-colors">
                <SiX size={18} />
              </span>
              <span className="text-muted-foreground cursor-pointer hover:text-primary transition-colors">
                <SiInstagram size={18} />
              </span>
            </div>
          </div>
          <div>
            <h4 className="font-semibold text-sm mb-3">Products</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li className="hover:text-primary transition-colors cursor-pointer">
                Personal Loan
              </li>
              <li className="hover:text-primary transition-colors cursor-pointer">
                Salary Advance
              </li>
              <li className="hover:text-primary transition-colors cursor-pointer">
                Emergency Loan
              </li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold text-sm mb-3">Company</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li className="hover:text-primary transition-colors cursor-pointer">
                About Us
              </li>
              <li className="hover:text-primary transition-colors cursor-pointer">
                Privacy Policy
              </li>
              <li className="hover:text-primary transition-colors cursor-pointer">
                Terms of Service
              </li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold text-sm mb-3">Contact</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>support@finflow.in</li>
              <li>1800-123-4567</li>
              <li>Mon–Sat, 9am–6pm</li>
            </ul>
          </div>
        </div>
        <div className="border-t border-border pt-6 text-center text-sm text-muted-foreground">
          © {year}. Built with ❤️ using{" "}
          <a
            href={utmLink}
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary hover:underline"
          >
            caffeine.ai
          </a>
        </div>
      </div>
    </footer>
  );
}
