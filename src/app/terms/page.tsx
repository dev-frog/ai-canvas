'use client';

import React from 'react';
import Header from '@/components/layout/Header';
import PublicFooter from '@/components/layout/PublicFooter';

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-white">
      <Header />

      <div className="max-w-4xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <div className="lg:text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900">Terms of Service</h1>
          <p className="mt-4 text-lg text-gray-600">
            Last updated: January 1, 2024
          </p>
        </div>

        <div className="prose prose-lg max-w-none">
          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">1. Acceptance of Terms</h2>
            <p className="text-gray-700 mb-4">
              By accessing and using AI Canvas ("Service"), you accept and agree to be bound by the terms
              and provision of this agreement. If you do not agree to abide by the above, please do not
              use this service.
            </p>
            <p className="text-gray-700 mb-4">
              These Terms of Service ("Terms") govern your use of our website located at aicanvas.com
              (the "Service") operated by AI Canvas ("us", "we", or "our").
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">2. Use License</h2>
            <p className="text-gray-700 mb-4">
              Permission is granted to temporarily download one copy of AI Canvas materials for personal,
              non-commercial transitory viewing only. This is the grant of a license, not a transfer of title, and under this license you may not:
            </p>
            <ul className="list-disc pl-6 text-gray-700 mb-4">
              <li>Modify or copy the materials</li>
              <li>Use the materials for any commercial purpose or for any public display</li>
              <li>Attempt to reverse engineer any software contained on the website</li>
              <li>Remove any copyright or other proprietary notations from the materials</li>
            </ul>
            <p className="text-gray-700 mb-4">
              This license shall automatically terminate if you violate any of these restrictions and may
              be terminated by us at any time. Upon terminating your viewing of these materials or upon
              the termination of this license, you must destroy any downloaded materials in your possession
              whether in electronic or printed format.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">3. User Accounts</h2>
            <p className="text-gray-700 mb-4">
              When you create an account with us, you must provide information that is accurate, complete,
              and current at all times. You are responsible for safeguarding the password that you use to
              access the Service and for all activities that occur under your account.
            </p>
            <p className="text-gray-700 mb-4">
              You agree not to disclose your password to any third party. You must notify us immediately
              upon becoming aware of any breach of security or unauthorized use of your account.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">4. Acceptable Use</h2>
            <p className="text-gray-700 mb-4">
              You may use our Service only for lawful purposes and in accordance with these Terms. You agree not to use the Service:
            </p>
            <ul className="list-disc pl-6 text-gray-700 mb-4">
              <li>In any way that violates any applicable federal, state, local, or international law or regulation</li>
              <li>To generate, distribute, or facilitate the distribution of unsolicited or unauthorized advertising or promotional material</li>
              <li>To impersonate or attempt to impersonate the Company, a Company employee, another user, or any other person or entity</li>
              <li>To engage in any other conduct that restricts or inhibits anyone's use or enjoyment of the Service</li>
              <li>To use the Service for academic dishonesty, including but not limited to plagiarism or contract cheating</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">5. AI-Generated Content</h2>
            <p className="text-gray-700 mb-4">
              Our Service uses artificial intelligence to provide writing assistance and suggestions. You acknowledge and agree that:
            </p>
            <ul className="list-disc pl-6 text-gray-700 mb-4">
              <li>AI-generated suggestions are meant to assist and enhance your writing, not replace your original thinking</li>
              <li>You are responsible for reviewing, editing, and taking ownership of all content you submit</li>
              <li>You must comply with your institution's academic integrity policies when using AI assistance</li>
              <li>We do not guarantee the accuracy, completeness, or appropriateness of AI-generated content</li>
              <li>You retain ownership of your original work and ideas</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">6. Academic Integrity</h2>
            <p className="text-gray-700 mb-4">
              AI Canvas is designed to support academic integrity, not undermine it. Users must:
            </p>
            <ul className="list-disc pl-6 text-gray-700 mb-4">
              <li>Use the Service in compliance with their educational institution's policies on AI assistance</li>
              <li>Properly attribute any sources suggested by our AI tools</li>
              <li>Ensure that submitted work represents their own understanding and effort</li>
              <li>Disclose the use of AI assistance when required by institutional policies</li>
            </ul>
            <p className="text-gray-700 mb-4">
              We reserve the right to terminate accounts that we reasonably believe are being used for academic dishonesty.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">7. Subscription and Billing</h2>
            <p className="text-gray-700 mb-4">
              Some parts of the Service are billed on a subscription basis. You will be billed in advance
              on a recurring and periodic basis. Billing cycles are set on a monthly or yearly basis,
              depending on the type of subscription plan you select.
            </p>
            <p className="text-gray-700 mb-4">
              At the end of each billing cycle, your subscription will automatically renew under the exact
              same conditions unless you cancel it or we cancel it. You may cancel your subscription renewal
              through your account settings page or by contacting our customer support team.
            </p>
            <p className="text-gray-700 mb-4">
              A valid payment method, including credit card, is required to process the payment for your subscription.
              You shall provide accurate and complete billing information including full name, address, state,
              zip code, telephone number, and valid payment method information.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">8. Refunds</h2>
            <p className="text-gray-700 mb-4">
              Except when required by law, paid subscription fees are non-refundable. Certain refund requests
              for subscriptions may be considered by us on a case-by-case basis and granted at our sole discretion.
            </p>
            <p className="text-gray-700 mb-4">
              If you believe you are entitled to a refund, please contact our support team with details about
              your subscription and the reason for your refund request.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">9. Intellectual Property Rights</h2>
            <p className="text-gray-700 mb-4">
              The Service and its original content, features, and functionality are and will remain the exclusive
              property of AI Canvas and its licensors. The Service is protected by copyright, trademark, and other laws.
            </p>
            <p className="text-gray-700 mb-4">
              You retain ownership of any content you create using our Service. By using the Service, you grant us
              a limited, non-exclusive, royalty-free license to use, process, and analyze your content solely for
              the purpose of providing the Service to you.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">10. User Content</h2>
            <p className="text-gray-700 mb-4">
              Our Service may allow you to post, link, store, share and otherwise make available certain information,
              text, graphics, videos, or other material. You are responsible for the content that you post to the Service,
              including its legality, reliability, and appropriateness.
            </p>
            <p className="text-gray-700 mb-4">
              By posting content to the Service, you grant us the right and license to use, modify, publicly perform,
              publicly display, reproduce, and distribute such content on and through the Service solely for the purpose
              of providing the Service.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">11. Privacy Policy</h2>
            <p className="text-gray-700 mb-4">
              Your privacy is important to us. Please review our Privacy Policy, which also governs your use of the Service,
              to understand our practices.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">12. Prohibited Uses</h2>
            <p className="text-gray-700 mb-4">
              You may not use our Service:
            </p>
            <ul className="list-disc pl-6 text-gray-700 mb-4">
              <li>For any unlawful purpose or to solicit others to engage in unlawful acts</li>
              <li>To violate any international, federal, provincial, or state regulations, rules, laws, or local ordinances</li>
              <li>To infringe upon or violate our intellectual property rights or the intellectual property rights of others</li>
              <li>To harass, abuse, insult, harm, defame, slander, disparage, intimidate, or discriminate</li>
              <li>To submit false or misleading information</li>
              <li>To upload or transmit viruses or any other type of malicious code</li>
              <li>To collect or track the personal information of others</li>
              <li>To spam, phish, pharm, pretext, spider, crawl, or scrape</li>
              <li>For any obscene or immoral purpose</li>
              <li>To interfere with or circumvent the security features of the Service</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">13. Termination</h2>
            <p className="text-gray-700 mb-4">
              We may terminate or suspend your account immediately, without prior notice or liability, for any reason
              whatsoever, including without limitation if you breach the Terms.
            </p>
            <p className="text-gray-700 mb-4">
              Upon termination, your right to use the Service will cease immediately. If you wish to terminate your
              account, you may simply discontinue using the Service.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">14. Disclaimer</h2>
            <p className="text-gray-700 mb-4">
              The information on this website is provided on an "as is" basis. To the fullest extent permitted by law,
              this Company:
            </p>
            <ul className="list-disc pl-6 text-gray-700 mb-4">
              <li>Excludes all representations and warranties relating to this website and its contents</li>
              <li>Excludes all liability for damages arising out of or in connection with your use of this website</li>
            </ul>
            <p className="text-gray-700 mb-4">
              The Service is provided on an "AS IS" and "AS AVAILABLE" basis. The Service is provided without warranties
              of any kind, whether express or implied, including, but not limited to, implied warranties of merchantability,
              fitness for a particular purpose, non-infringement or course of performance.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">15. Limitation of Liability</h2>
            <p className="text-gray-700 mb-4">
              In no event shall AI Canvas, nor its directors, employees, partners, agents, suppliers, or affiliates,
              be liable for any indirect, incidental, special, consequential, or punitive damages, including without
              limitation, loss of profits, data, use, goodwill, or other intangible losses, resulting from your use
              of the Service.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">16. Governing Law</h2>
            <p className="text-gray-700 mb-4">
              These Terms shall be interpreted and governed by the laws of the State of [Your State], United States.
              If a provision of this agreement is or becomes illegal, invalid, or unenforceable in any jurisdiction,
              that shall not affect the validity or enforceability in that jurisdiction of any other provision hereof
              or the validity or enforceability in other jurisdictions of that or any other provision hereof.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">17. Changes to Terms</h2>
            <p className="text-gray-700 mb-4">
              We reserve the right, at our sole discretion, to modify or replace these Terms at any time. If a revision
              is material, we will try to provide at least 30 days notice prior to any new terms taking effect. What
              constitutes a material change will be determined at our sole discretion.
            </p>
            <p className="text-gray-700 mb-4">
              By continuing to access or use our Service after those revisions become effective, you agree to be bound
              by the revised terms. If you do not agree to the new terms, please stop using the Service.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">18. Contact Information</h2>
            <p className="text-gray-700 mb-4">
              If you have any questions about these Terms of Service, please contact us:
            </p>
            <div className="bg-gray-50 p-6 rounded-lg">
              <p className="text-gray-700">
                <strong>Email:</strong> legal@aicanvas.com<br/>
                <strong>Address:</strong> 123 Education Street, Learning City, LC 12345<br/>
                <strong>Phone:</strong> +1 (555) 123-4567
              </p>
            </div>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">19. Entire Agreement</h2>
            <p className="text-gray-700 mb-4">
              These Terms of Service, together with our Privacy Policy and any other legal notices published by us
              on the Service, shall constitute the entire agreement between you and AI Canvas concerning the Service.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">20. Waiver and Severability</h2>
            <p className="text-gray-700 mb-4">
              No waiver of any term of these Terms shall be deemed a further or continuing waiver of such term or any
              other term, and our failure to assert any right or provision under these Terms shall not constitute a
              waiver of such right or provision.
            </p>
            <p className="text-gray-700 mb-4">
              If any provision of these Terms is held by a court or other tribunal of competent jurisdiction to be invalid,
              illegal, or unenforceable for any reason, such provision shall be eliminated or limited to the minimum extent
              such that the remaining provisions of the Terms will continue in full force and effect.
            </p>
          </section>

          <div className="bg-blue-50 p-6 rounded-lg mt-8">
            <h3 className="text-lg font-medium text-blue-900 mb-2">Questions About These Terms?</h3>
            <p className="text-blue-700 mb-3">
              We're here to help clarify any questions you might have about our Terms of Service.
            </p>
            <a
              href="/contact"
              className="inline-flex items-center text-blue-600 hover:text-blue-500 font-medium"
            >
              Contact Our Legal Team →
            </a>
          </div>
        </div>
      </div>

      <PublicFooter />
    </div>
  );
}