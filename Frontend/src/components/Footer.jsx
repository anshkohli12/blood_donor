import { Link } from "react-router-dom"
import { Heart, Phone, Mail, MapPin, Facebook, Twitter, Instagram, Linkedin } from "lucide-react"

const Footer = () => {
  const currentYear = new Date().getFullYear()

  const quickLinks = [
    { name: "About Us", path: "/about" },
    { name: "Find Donors", path: "/find-donors" },
    { name: "Blood Banks", path: "/blood-banks" },
    { name: "Events", path: "/events" },
    { name: "Contact", path: "/contact" },
  ]

  const donorLinks = [
    { name: "Become Donor", path: "/become-donor" },
    { name: "Request Blood", path: "/request-blood" },
    { name: "Donation Process", path: "/about#process" },
    { name: "Eligibility", path: "/about#eligibility" },
  ]

  const resourceLinks = [
    { name: "Help Center", path: "/help" },
    { name: "FAQs", path: "/faq" },
    { name: "Blood Types", path: "/blood-types" },
    { name: "Health Benefits", path: "/benefits" },
    { name: "Community", path: "/community" },
  ]

  const socialLinks = [
    { name: "Facebook", icon: Facebook, href: "#" },
    { name: "Twitter", icon: Twitter, href: "#" },
    { name: "Instagram", icon: Instagram, href: "#" },
    { name: "LinkedIn", icon: Linkedin, href: "#" },
  ]

  return (
    <footer className="bg-gray-dark text-white">
      <div className="container-custom py-16">
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-8 md:gap-6 lg:gap-8">
          {/* Brand Section */}
          <div className="space-y-5 md:col-span-3 lg:col-span-2">
            <Link to="/" className="flex items-center space-x-2 group">
              <Heart className="h-7 w-7 text-blood-crimson fill-current group-hover:text-blood-light transition-colors" />
              <span className="text-lg font-bold font-montserrat group-hover:text-blood-light transition-colors leading-tight">
                Blood Donor Network
              </span>
            </Link>
            <p className="text-gray-300 leading-relaxed text-sm pr-8 lg:pr-12">
              Connecting life-savers with those in need. Every drop counts, every donation matters. Join our community of heroes making a difference.
            </p>
            <div className="flex space-x-3">
              {socialLinks.map((social) => {
                const Icon = social.icon
                return (
                  <a
                    key={social.name}
                    href={social.href}
                    className="p-2 bg-gray-800 rounded-full hover:bg-blood-crimson transition-all duration-300 group"
                    aria-label={social.name}
                  >
                    <Icon className="h-4 w-4 group-hover:text-white" />
                  </a>
                )
              })}
            </div>
          </div>

          {/* Quick Links */}
          <div className="lg:ml-4">
            <h3 className="text-lg font-semibold font-montserrat text-blood-light mb-4">Quick Links</h3>
            <ul className="space-y-2.5">
              {quickLinks.map((link) => (
                <li key={link.name}>
                  <Link to={link.path} className="text-gray-300 hover:text-blood-light transition-colors text-sm block">
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Resources Section */}
          <div>
            <h3 className="text-lg font-semibold font-montserrat text-blood-light mb-4">Resources</h3>
            <ul className="space-y-2.5">
              {resourceLinks.map((link) => (
                <li key={link.name}>
                  <Link to={link.path} className="text-gray-300 hover:text-blood-light transition-colors text-sm block">
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Donor Resources */}
          <div>
            <h3 className="text-lg font-semibold font-montserrat text-blood-light mb-4">For Donors</h3>
            <ul className="space-y-2.5">
              {donorLinks.map((link) => (
                <li key={link.name}>
                  <Link to={link.path} className="text-gray-300 hover:text-blood-light transition-colors text-sm block">
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h3 className="text-lg font-semibold font-montserrat text-blood-light mb-4">Contact Us</h3>
            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <Phone className="h-4 w-4 text-blood-crimson flex-shrink-0" />
                <span className="text-gray-300 text-sm">+1 (555) 123-BLOOD</span>
              </div>
              <div className="flex items-center space-x-3">
                <Mail className="h-4 w-4 text-blood-crimson flex-shrink-0" />
                <span className="text-gray-300 text-sm">help@blooddonornetwork.org</span>
              </div>
              <div className="flex items-start space-x-3">
                <MapPin className="h-4 w-4 text-blood-crimson mt-0.5 flex-shrink-0" />
                <span className="text-gray-300 text-sm leading-relaxed">
                  123 Life Saver Street<br />
                  Hope City, HC 12345
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="border-t border-gray-800 mt-12 pt-6">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-3 md:space-y-0">
            <p className="text-gray-400 text-sm">© {currentYear} Blood Donor Network. All rights reserved.</p>
            <div className="flex flex-wrap justify-center md:justify-end space-x-6 text-sm">
              <Link to="/privacy" className="text-gray-400 hover:text-blood-light transition-colors">
                Privacy Policy
              </Link>
              <Link to="/terms" className="text-gray-400 hover:text-blood-light transition-colors">
                Terms of Service
              </Link>
              <Link to="/cookies" className="text-gray-400 hover:text-blood-light transition-colors">
                Cookie Policy
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}

export default Footer
