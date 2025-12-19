import HeroSection from "../../components/home/HeroSection";
import FeaturedTripsSection from "../../components/home/FeaturedTripsSection";
import LatestBlogsSection from "../../components/home/LatestBlogsSection";
import CTASection from "../../components/home/CTASection";

export default function HomePage() {
  return (
    <>
      <HeroSection />
      <FeaturedTripsSection />
      <LatestBlogsSection />
      <CTASection />
    </>
  );
}
