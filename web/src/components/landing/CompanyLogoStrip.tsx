import type { SVGProps } from "react";

type LogoProps = SVGProps<SVGSVGElement>;

function GoogleLogo(props: LogoProps) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-label="Google" {...props}>
      <path d="M12.24 10.285V13.8h6.887C18.2 16.543 15.64 18.6 12.24 18.6c-3.645 0-6.6-2.955-6.6-6.6s2.955-6.6 6.6-6.6c1.635 0 3.12.585 4.29 1.56l2.67-2.67C17.58 2.67 15.06 1.8 12.24 1.8 6.585 1.8 2 6.385 2 12.04s4.585 10.24 10.24 10.24c5.91 0 9.84-4.155 9.84-10.02 0-.675-.06-1.32-.18-1.975H12.24z" />
    </svg>
  );
}

function MetaLogo(props: LogoProps) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-label="Meta" {...props}>
      <path d="M12 8.358c-1.63 0-3.078 1.134-3.957 2.686-.88 1.551-1.285 3.324-1.285 4.956 0 1.631.406 3.404 1.285 4.956.88 1.552 2.328 2.686 3.957 2.686 1.63 0 3.078-1.134 3.957-2.686.88-1.552 1.285-3.325 1.285-4.956 0-1.632-.406-3.405-1.285-4.956C15.078 9.492 13.63 8.358 12 8.358zm10.74 4.316C21.724 6.786 17.514 2 12 2S2.276 6.786 1.26 12.674c-.266 1.547-.197 3.109.204 4.603.4 1.493 1.127 2.871 2.122 4.025C5.076 22.954 7.217 24 9.61 24c2.14 0 4.077-.852 5.568-2.28 1.491 1.428 3.428 2.28 5.568 2.28 2.393 0 4.534-1.046 6.024-2.7 1-.153 1.72-.53 2.122-2.023.402-1.494.47-3.056.204-4.603z" />
    </svg>
  );
}

function AppleLogo(props: LogoProps) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-label="Apple" {...props}>
      <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M15.97 6.38c.62-.75 1.04-1.8 0.93-2.85-.9.04-1.99.6-2.61 1.34-.55.63-.99 1.68-.86 2.7 1.01.08 2.01-.52 2.54-1.19" />
    </svg>
  );
}

function AmazonLogo(props: LogoProps) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-label="Amazon" {...props}>
      <path d="M13.918 16.593c-2.36 1.737-5.786 2.668-8.742 2.668-4.148 0-7.88-1.532-10.7-4.086-.222-.2-.023-.473.238-.323 3.05 1.761 6.812 2.823 10.686 2.823 2.632 0 5.516-.549 8.167-1.696.398-.172.73.266.351.614zM15.467 15.11c-.302-.387-.698-.242-.907-.021-.861.91-1.992 1.488-3.23 1.637-.289.034-.343.344-.083.473 1.353.673 2.91.492 4.088-.506.27-.229.336-.786.132-1.583zM14.07 6.138c-.378-.456-1.018-.748-1.666-.748-1.66 0-2.894 1.408-2.894 3.292 0 1.942 1.157 3.234 2.83 3.234.629 0 1.258-.293 1.67-.783v.654c0 .874-.482 1.378-1.42 1.378-.85 0-1.342-.456-1.482-1.077-.042-.19-.193-.31-.386-.31h-1.06c-.194 0-.356.16-.328.354.27 1.776 1.585 2.766 3.268 2.766 2.052 0 3.238-1.129 3.238-3.155V7.47c0-.98-.041-1.643-.092-2.148-.024-.236-.208-.415-.445-.415h-1.012c-.221 0-.404.156-.437.375l-.084.856zm-1.57 4.298c-.85 0-1.408-.687-1.408-1.782 0-1.05.589-1.748 1.408-1.748.802 0 1.378.715 1.378 1.748 0 1.078-.564 1.782-1.378 1.782z" />
    </svg>
  );
}

function StripeLogo(props: LogoProps) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-label="Stripe" {...props}>
      <path d="M13.976 9.15c0-.93-.787-1.37-2.062-1.37-1.854 0-4.184.774-4.184.774l-.707-3.418s2.615-.992 5.253-.992c4.137 0 6.648 2.08 6.648 5.485 0 5.422-7.447 5.674-7.447 8.59 0 1.13.972 1.535 2.378 1.535 2.317 0 4.79-1.096 4.79-1.096l.729 3.447s-2.88 1.258-5.748 1.258c-4.485 0-7.23-2.223-7.23-5.69 0-5.714 7.58-6.074 7.58-8.522z" />
    </svg>
  );
}

function NetflixLogo(props: LogoProps) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-label="Netflix" {...props}>
      <path d="M5.398 0v24c1.176-.23 2.371-.42 3.585-.572V0H5.398zm9.619 0v16.143l-4.52-14.86c-.958.077-1.92.176-2.887.294V24c1.178-.13 2.373-.24 3.586-.33V7.857l4.52 14.86c.958-.077 1.92-.176 2.887-.294V0h-3.586z" />
    </svg>
  );
}

function MicrosoftLogo(props: LogoProps) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-label="Microsoft" {...props}>
      <path d="M1 1h10v10H1V1zm12 0h10v10H13V1zM1 13h10v10H1V13zm12 0h10v10H13V13z" />
    </svg>
  );
}

function UberLogo(props: LogoProps) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-label="Uber" {...props}>
      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 17.5c-4.14 0-7.5-3.36-7.5-7.5S7.86 4.5 12 4.5s7.5 3.36 7.5 7.5-3.36 7.5-7.5 7.5zm-3-9.5h6v4H9v-4z" />
    </svg>
  );
}

const COMPANIES = [
  { name: "Google", Component: GoogleLogo },
  { name: "Meta", Component: MetaLogo },
  { name: "Apple", Component: AppleLogo },
  { name: "Amazon", Component: AmazonLogo },
  { name: "Stripe", Component: StripeLogo },
  { name: "Netflix", Component: NetflixLogo },
  { name: "Microsoft", Component: MicrosoftLogo },
  { name: "Uber", Component: UberLogo },
];

export function CompanyLogoStrip() {
  return (
    <section
      aria-label="Companies whose engineers use leetExpert"
      className="border-b border-border/70 py-10 sm:py-12"
    >
      <div className="mx-auto max-w-5xl px-4 text-center">
        <p className="font-mono text-[11px] font-medium tracking-[0.18em] text-muted uppercase sm:text-xs">
          Engineers from top teams prepare and master algorithms here
        </p>

        <div className="mt-8 grid grid-cols-4 items-center justify-items-center gap-6 sm:grid-cols-8 sm:gap-8">
          {COMPANIES.map(({ name, Component }) => (
            <div
              key={name}
              className="group flex flex-col items-center justify-center gap-1.5 transition-transform duration-[var(--dur-fast)] hover:scale-110 motion-reduce:transition-none"
              title={`Engineers from ${name}`}
            >
              <Component className="h-6 w-6 text-muted transition-colors duration-[var(--dur-fast)] group-hover:text-foreground sm:h-7 sm:w-7" />
              <span className="sr-only sm:not-sr-only text-[10px] font-medium text-muted/80 tracking-wide transition-colors duration-[var(--dur-fast)] group-hover:text-foreground">
                {name}
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
