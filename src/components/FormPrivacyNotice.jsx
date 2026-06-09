import { Link } from 'react-router-dom'

export default function FormPrivacyNotice() {
  return (
    <p className="text-xs text-[#4A5580] leading-relaxed text-center">
      Vos données sont transmises de façon sécurisée (HTTPS) et utilisées uniquement pour vous
      répondre. Conservation maximale de 12 mois ; suppression possible à tout moment par un
      administrateur.{' '}
      <Link to="/confidentialite" className="text-[#1E3A8A] underline hover:text-[#2B52C8]">
        Politique de confidentialité
      </Link>
    </p>
  )
}
