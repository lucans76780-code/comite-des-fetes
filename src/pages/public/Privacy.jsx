import Hero from '../../components/Hero'
import { SITE_URL } from '../../lib/seo'

const LAST_UPDATED = '3 juin 2026'

function Section({ title, children }) {
  return (
    <section className="mb-8">
      <h2
        className="text-[#1E3A8A] text-2xl tracking-wide mb-3"
        style={{ fontFamily: "'Bebas Neue', sans-serif" }}
      >
        {title}
      </h2>
      <div className="text-[#1A2640] text-sm leading-relaxed space-y-3">{children}</div>
    </section>
  )
}

export default function Privacy() {
  return (
    <div>
      <Hero title="Politique de confidentialité" subtitle="Protection de vos données personnelles" />

      <article className="max-w-3xl mx-auto px-4 py-12">
        <p className="text-[#4A5580] text-sm mb-10">
          Dernière mise à jour : <strong>{LAST_UPDATED}</strong>
        </p>

        <Section title="1. Qui sommes-nous ?">
          <p>
            Le site <a href={SITE_URL} className="text-[#1E3A8A] underline">{SITE_URL}</a> est édité
            par le <strong>Comité des fêtes d&apos;Argueil</strong> (« Anim Argueil »), association
            chargée de l&apos;organisation des festivités et de l&apos;animation de la vie locale à
            Argueil (Seine-Maritime).
          </p>
          <p>
            <strong>Responsable du traitement :</strong> Comité des fêtes d&apos;Argueil
            <br />
            <strong>Contact :</strong>{' '}
            <a href="mailto:animargueil@gmail.com" className="text-[#1E3A8A] underline">
              animargueil@gmail.com
            </a>
          </p>
        </Section>

        <Section title="2. Quelles données collectons-nous ?">
          <p>
            <strong>Formulaire « Nous contacter »</strong> : nom, prénom, adresse e-mail, numéro de
            téléphone (facultatif), sujet et message.
          </p>
          <p>
            <strong>Formulaire « Vos suggestions »</strong> : nom, prénom, adresse e-mail, numéro de
            téléphone (facultatif) et texte de la suggestion.
          </p>
          <p>
            <strong>Données de navigation</strong> : si vous acceptez le bandeau cookies, le site
            utilise Google Analytics 4 pour mesurer la fréquentation (pages visitées, origine du
            trafic, type d&apos;appareil). Sans votre accord, ce suivi n&apos;est pas activé.
          </p>
          <p>
            Nous ne vendons pas vos données et ne les utilisons pas à des fins publicitaires.
          </p>
        </Section>

        <Section title="3. Pourquoi collectons-nous ces données ?">
          <ul className="list-disc pl-5 space-y-2">
            <li>
              <strong>Répondre à vos messages</strong> — intérêt légitime et exécution de votre
              demande.
            </li>
            <li>
              <strong>Prendre en compte vos suggestions</strong> — intérêt légitime pour
              l&apos;organisation des événements.
            </li>
            <li>
              <strong>Mesurer l&apos;audience du site</strong> — uniquement avec votre consentement
              (cookies Analytics).
            </li>
          </ul>
        </Section>

        <Section title="4. Combien de temps conservons-nous vos données ?">
          <p>
            <strong>Messages de contact et suggestions</strong> : les données sont conservées le
            temps nécessaire pour traiter votre demande et vous répondre. Elles sont{' '}
            <strong>supprimées définitivement</strong> lorsqu&apos;un administrateur du Comité des
            fêtes d&apos;Argueil les efface depuis l&apos;espace d&apos;administration du site.
          </p>
          <p>
            <strong>Données d&apos;audience (Google Analytics)</strong> : conservées selon les
            paramètres de Google Analytics (généralement jusqu&apos;à 14 mois selon la
            configuration). Vous pouvez refuser ce suivi via le bandeau cookies.
          </p>
        </Section>

        <Section title="5. Qui a accès à vos données ?">
          <ul className="list-disc pl-5 space-y-2">
            <li>Les administrateurs autorisés du Comité des fêtes d&apos;Argueil.</li>
            <li>
              Nos prestataires techniques : <strong>Vercel</strong> (hébergement),{' '}
              <strong>Supabase</strong> (stockage des messages), <strong>Google</strong> (Analytics
              si accepté).
            </li>
          </ul>
          <p>
            Ces prestataires peuvent traiter certaines données hors Union européenne ; ils
            appliquent des garanties contractuelles appropriées.
          </p>
        </Section>

        <Section title="6. Sécurité">
          <p>
            Les échanges entre votre navigateur et le site sont chiffrés (<strong>HTTPS</strong>).
            L&apos;accès à l&apos;administration est protégé par identifiants. Seuls les
            administrateurs du comité peuvent consulter les messages reçus.
          </p>
        </Section>

        <Section title="7. Vos droits">
          <p>
            Conformément au <strong>RGPD</strong> et à la loi « Informatique et Libertés », vous
            disposez des droits d&apos;accès, de rectification, d&apos;effacement, d&apos;opposition,
            de limitation et de retrait du consentement (cookies Analytics).
          </p>
          <p>
            Pour exercer vos droits :{' '}
            <a href="mailto:animargueil@gmail.com" className="text-[#1E3A8A] underline">
              animargueil@gmail.com
            </a>
            . Nous répondrons dans un délai d&apos;un mois.
          </p>
          <p>
            Vous pouvez introduire une réclamation auprès de la{' '}
            <a
              href="https://www.cnil.fr"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[#1E3A8A] underline"
            >
              CNIL
            </a>
            .
          </p>
        </Section>

        <Section title="8. Cookies">
          <p>
            Le site peut déposer des cookies Analytics <strong>uniquement si vous acceptez</strong>{' '}
            le bandeau affiché à votre première visite. En cas de refus, aucun cookie Analytics
            n&apos;est déposé. Les formulaires contact et suggestions ne nécessitent pas
            l&apos;acceptation des cookies Analytics.
          </p>
        </Section>

        <Section title="9. Liens vers des sites tiers">
          <p>
            Le site peut contenir des liens vers Facebook, Google Maps ou d&apos;autres services.
            Leur politique de confidentialité s&apos;applique lorsque vous les consultez.
          </p>
        </Section>

        <Section title="10. Modifications">
          <p>
            Cette politique peut être mise à jour. La date de dernière mise à jour est indiquée en
            haut de cette page.
          </p>
        </Section>
      </article>
    </div>
  )
}
