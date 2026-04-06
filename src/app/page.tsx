import Link from "next/link";
import { ArrowRight, CheckCircle, BarChart2, FileText, Bell, Scale } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

const FEATURES = [
  {
    icon: BarChart2,
    title: "Feasibility Engine",
    description:
      "Based on real planning decisions in your borough. Know your approval odds before you spend a penny on an architect.",
    highlight: "82% approval rate for rear extensions in Hackney",
  },
  {
    icon: FileText,
    title: "Document Generator",
    description:
      "AI-drafted Design & Access Statements, Planning Statements, and cover letters — documents that normally cost £500+ from an architect.",
    highlight: "Ready in minutes, not weeks",
  },
  {
    icon: Bell,
    title: "Application Tracker",
    description:
      "Monitor your application in real time. Know when an officer is assigned, when objections are filed, and when a decision is due.",
    highlight: "Plain-language alerts at every stage",
  },
  {
    icon: Scale,
    title: "Appeals Support",
    description:
      "Refused? Around 35% of householder appeals succeed. We analyse the refusal, assess viability, and draft your appeal statement.",
    highlight: "A service that normally costs £2,500–5,000",
  },
];

const STATS = [
  { value: "340+", label: "Local authorities covered" },
  { value: "82%", label: "Avg approval rate for suitable projects" },
  { value: "35%", label: "Of householder appeals succeed" },
  { value: "8 weeks", label: "Statutory decision window" },
];

export default function LandingPage() {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-[#E5E0D8] bg-white/95 backdrop-blur-sm">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#1A3A2A]">
                <span className="text-xs font-bold text-[#C8A96E]">PP</span>
              </div>
              <span className="text-lg font-semibold">
                Planning<span className="text-[#1A3A2A]">Perm</span>
              </span>
            </div>
            <div className="flex items-center gap-3">
              <Link href="/sign-in">
                <Button variant="ghost" size="sm">Sign in</Button>
              </Link>
              <Link href="/sign-up">
                <Button size="sm">Get started</Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      <main className="flex-1">
        {/* Hero */}
        <section className="relative overflow-hidden bg-[#1A3A2A] px-4 py-24 sm:px-6 lg:px-8">
          {/* Background texture */}
          <div className="absolute inset-0 opacity-5"
            style={{
              backgroundImage: "radial-gradient(circle at 25% 25%, #C8A96E 0%, transparent 50%), radial-gradient(circle at 75% 75%, #C8A96E 0%, transparent 50%)",
            }}
          />
          <div className="relative mx-auto max-w-4xl text-center">
            <Badge className="mb-6 bg-[#C8A96E]/20 text-[#C8A96E] border-[#C8A96E]/30">
              AI-powered planning guidance
            </Badge>
            <h1 className="text-4xl font-bold tracking-tight text-white sm:text-5xl lg:text-6xl">
              Will your project get{" "}
              <span className="text-[#C8A96E]">planning permission?</span>
            </h1>
            <p className="mt-6 text-lg leading-8 text-white/70 max-w-2xl mx-auto">
              Not a chatbot. A genuine feasibility assessment based on{" "}
              <strong className="text-white">real planning decisions</strong> in
              your borough, your council&apos;s policies, and permitted
              development rules — before you spend anything on an architect.
            </p>
            <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/sign-up">
                <Button size="xl" variant="accent" className="w-full sm:w-auto">
                  Check my project free
                  <ArrowRight className="h-5 w-5" />
                </Button>
              </Link>
              <Link href="#how-it-works">
                <Button
                  size="xl"
                  variant="outline"
                  className="w-full sm:w-auto border-white/20 text-white hover:bg-white/10 hover:text-white bg-transparent"
                >
                  How it works
                </Button>
              </Link>
            </div>
          </div>
        </section>

        {/* Stats bar */}
        <section className="border-b border-[#E5E0D8] bg-white">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
            <dl className="grid grid-cols-2 gap-8 md:grid-cols-4">
              {STATS.map((stat) => (
                <div key={stat.label} className="text-center">
                  <dt className="text-3xl font-bold text-[#1A3A2A]">{stat.value}</dt>
                  <dd className="mt-1 text-sm text-[#6B7280]">{stat.label}</dd>
                </div>
              ))}
            </dl>
          </div>
        </section>

        {/* What we actually do */}
        <section id="how-it-works" className="py-20 px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-7xl">
            <div className="text-center mb-16">
              <Badge variant="secondary" className="mb-4">The platform</Badge>
              <h2 className="text-3xl font-bold sm:text-4xl">
                From first idea to decision granted
              </h2>
              <p className="mt-4 text-[#6B7280] max-w-2xl mx-auto">
                Planning permission is opaque, expensive, and intimidating. We
                give homeowners the same intelligence that architects and planning
                consultants charge thousands for.
              </p>
            </div>

            <div className="grid gap-8 md:grid-cols-2">
              {FEATURES.map((feature) => (
                <div
                  key={feature.title}
                  className="rounded-2xl border border-[#E5E0D8] bg-white p-8 hover:border-[#1A3A2A]/30 transition-colors"
                >
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#1A3A2A]/8 mb-6">
                    <feature.icon className="h-6 w-6 text-[#1A3A2A]" />
                  </div>
                  <h3 className="text-xl font-semibold mb-3">{feature.title}</h3>
                  <p className="text-[#6B7280] mb-4">{feature.description}</p>
                  <div className="flex items-center gap-2 text-sm font-medium text-[#1A3A2A]">
                    <CheckCircle className="h-4 w-4 text-[#C8A96E]" />
                    {feature.highlight}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Sample report preview */}
        <section className="bg-[#F0EDE6] py-20 px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-4xl">
            <div className="text-center mb-12">
              <Badge variant="secondary" className="mb-4">Example report</Badge>
              <h2 className="text-3xl font-bold">
                This is what you&apos;ll get
              </h2>
              <p className="mt-4 text-[#6B7280]">
                A real feasibility assessment — not generic advice.
              </p>
            </div>

            {/* Mock report card */}
            <div className="rounded-2xl border border-[#E5E0D8] bg-white shadow-lg overflow-hidden">
              <div className="bg-[#1A3A2A] px-6 py-4">
                <p className="text-[#C8A96E] text-sm font-medium">Feasibility Assessment</p>
                <p className="text-white font-semibold">
                  Single-storey rear extension, 4m depth — Semi-detached, Hackney
                </p>
              </div>
              <div className="p-6">
                {/* Score */}
                <div className="flex items-center gap-4 mb-6">
                  <div className="flex h-20 w-20 flex-shrink-0 items-center justify-center rounded-full border-4 border-green-500 bg-green-50">
                    <span className="text-2xl font-bold text-green-700">79%</span>
                  </div>
                  <div>
                    <p className="font-semibold text-lg">Likely Approved</p>
                    <p className="text-[#6B7280] text-sm">
                      Based on 47 similar applications in Hackney over the past 3
                      years, 79% were approved. The primary risk is the proximity
                      to the boundary — ensure compliance with the 45-degree rule.
                    </p>
                  </div>
                </div>

                {/* Comparable cases */}
                <div className="border-t border-[#E5E0D8] pt-4">
                  <p className="text-sm font-semibold text-[#6B7280] mb-3">
                    COMPARABLE DECISIONS NEARBY
                  </p>
                  <div className="space-y-2">
                    {[
                      { ref: "2023/1847", addr: "14 Queensdown Road E9", decision: "approved", desc: "Rear extension 4m depth" },
                      { ref: "2023/0921", addr: "7 Median Road E5", decision: "approved", desc: "Single-storey rear extension" },
                      { ref: "2022/3341", addr: "22 Chatsworth Road E5", decision: "refused", desc: "Rear extension — over boundary" },
                    ].map((c) => (
                      <div key={c.ref} className="flex items-center justify-between py-2">
                        <div>
                          <span className="text-xs text-[#9CA3AF] mr-2">{c.ref}</span>
                          <span className="text-sm text-[#1A1F2E]">{c.addr}</span>
                          <span className="text-xs text-[#6B7280] ml-2">— {c.desc}</span>
                        </div>
                        <Badge variant={c.decision === "approved" ? "success" : "destructive"}>
                          {c.decision}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="py-20 px-4 sm:px-6 lg:px-8 text-center">
          <div className="mx-auto max-w-2xl">
            <h2 className="text-3xl font-bold mb-4">
              Ready to find out if your project will be approved?
            </h2>
            <p className="text-[#6B7280] mb-8">
              Get a free feasibility assessment in minutes. No credit card required.
            </p>
            <Link href="/sign-up">
              <Button size="xl" className="gap-2">
                Start free assessment
                <ArrowRight className="h-5 w-5" />
              </Button>
            </Link>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-[#E5E0D8] bg-white py-8 px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl flex flex-col sm:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-2">
            <div className="flex h-6 w-6 items-center justify-center rounded bg-[#1A3A2A]">
              <span className="text-[9px] font-bold text-[#C8A96E]">PP</span>
            </div>
            <span className="text-sm font-medium">PlanningPerm</span>
          </div>
          <p className="text-xs text-[#9CA3AF]">
            © {new Date().getFullYear()} PlanningPerm. Planning data sourced from public Planning Portal records.
          </p>
        </div>
      </footer>
    </div>
  );
}
