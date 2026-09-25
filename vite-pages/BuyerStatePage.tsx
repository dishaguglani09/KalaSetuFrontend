import { useParams } from 'react-router-dom';

import SectionHead from '@/components/state/SectionHead';
import StateHero from '@/components/state/StateHero';
import StateNav, { type NavLink } from '@/components/state/StateNav';
import HighlightStrip from '@/components/state/HighlightStrip';
import CultureStrip from '@/components/state/CultureStrip';
import CraftStory from '@/components/state/CraftStory';
import CraftBrief from '@/components/state/CraftBrief';
import DistrictMapPanel from '@/components/state/DistrictMapPanel';
import ClosingCTA from '@/components/state/ClosingCTA';
import RevealRoot from '@/components/state/RevealRoot';
import { ExperienceList, TourismStrip } from '@/components/state/StateAside';

import { statePage } from '@/lib/states';
import { stateThemeVars } from '@/lib/states/theme';
import { themeFor } from '@/lib/stateThemes';

export default function BuyerStatePage() {
  const { slug } = useParams<{ slug: string }>();
  
  if (!slug) {
    return <div>Not Found</div>; // Or your equivalent 404 UI
  }

  const page = statePage(slug);
  
  if (!page) {
    return <div>Not Found</div>; // Or your equivalent 404 UI
  }

  const theme = themeFor(page.state);
  const districtName = (id: string) =>
    page.districts?.find(d => d.id === id)?.name ?? id;
  const productsOf = (craftId: string) =>
    page.products?.filter(p => p.craft === craftId) ?? [];

  const hasMap = Boolean(page.geojson && page.districtProperty && page.districts?.length);
  const hasChapters = Boolean(page.chapters?.length);
  const hasCrafts = Boolean(page.crafts?.length);
  const hasBriefs = !hasCrafts && Boolean(page.craftNames?.length);
  const hasExperiences = Boolean(page.experiences?.length);
  const hasDestinations = Boolean(page.destinations?.length);

  const links: NavLink[] = [
    hasMap && { href: '#map', label: 'The map' },
    hasChapters && { href: '#culture', label: 'Culture' },
    (hasCrafts || hasBriefs) && {
      href: '#crafts',
      label: hasCrafts ? 'Crafts & shop' : 'Crafts',
    },
    hasExperiences && { href: '#experiences', label: 'Experiences' },
    hasDestinations && { href: '#visit', label: 'Visit' },
  ].filter(Boolean) as NavLink[];

  return (
    <article className="kk-st" style={stateThemeVars(page.state)}>
      <RevealRoot />
      <noscript>
        <style>{'[data-reveal] > * { opacity: 1 !important; transform: none !important; }'}</style>
      </noscript>

      <StateHero page={page} />
      <HighlightStrip page={page} art={theme.art} />
      <StateNav links={links} />

      {hasMap && (
        <section className="kk-st-section" id="map">
          <SectionHead
            label="The ground"
            title="Where the work is made"
            motif={theme.motif}
            lede="Craft here is local to the point of being village-specific. Select a district to fly to it."
          />
          <DistrictMapPanel
            geojson={page.geojson!}
            districtProperty={page.districtProperty!}
            districts={page.districts!}
          />
        </section>
      )}

      {hasChapters && (
        <section className="kk-st-section kk-st-section--wash" id="culture">
          <SectionHead label="The story" title={page.tagline} motif="kalash" />
          <CultureStrip chapters={page.chapters!} />
        </section>
      )}

      {(hasCrafts || hasBriefs) && (
        <section className="kk-st-section" id="crafts">
          <SectionHead
            label={hasCrafts ? 'Art, craft & shop' : 'Art & craft'}
            title="The living traditions"
            motif="peacock"
            lede={hasCrafts
              ? 'Each is still practised commercially by households in the district named — not revived for a museum. Open one to read it and to buy from it.'
              : `${theme.art} leads here, alongside the traditions below. We are still working with makers in this region — the full catalogue follows.`}
          />
          {hasCrafts ? (
            <div className="kk-st-crafts" data-reveal>
              {page.crafts!.map((craft, i) => (
                <CraftStory
                  key={craft.id}
                  craft={craft}
                  products={productsOf(craft.id)}
                  districtName={districtName(craft.district)}
                  open={i === 0}
                />
              ))}
            </div>
          ) : (
            <CraftBrief crafts={page.craftNames!} motif={theme.motif} art={theme.art} />
          )}
        </section>
      )}

      {hasExperiences && (
        <section className="kk-st-section kk-st-section--wash" id="experiences">
          <SectionHead
            label="Experiences"
            title="Sit down with the makers"
            motif="lotus"
            lede="Booked directly with the households and collectives that run them."
          />
          <ExperienceList experiences={page.experiences!} />
        </section>
      )}

      {hasDestinations && (
        <section className="kk-st-section kk-st-section--quiet" id="visit">
          <SectionHead
            label="While you are here"
            title="Worth the detour"
            motif="stupa"
            lede="The craft is the reason to come. These are the reasons to stay a few days longer."
          />
          <TourismStrip destinations={page.destinations!} />
        </section>
      )}

      <ClosingCTA
        state={page.title}
        motif={theme.motif}
        shloka={theme.shloka.native}
        detailed={hasCrafts}
      />
    </article>
  );
}
