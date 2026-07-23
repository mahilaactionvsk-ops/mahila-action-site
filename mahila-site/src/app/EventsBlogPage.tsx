import { useState } from "react";
import { BlogPost } from "../lib/data";
import { BlogDetailModal } from "./BlogDetailModal";

const fraunces = () => `font-['Fraunces',serif]`;
const inter = () => `font-['Inter',sans-serif]`;

function SectionLabel({ text }: { text: string }) {
  return <p className={`${inter()} text-[#a65a4a] text-[14px] font-bold uppercase tracking-[2px]`}>{text}</p>;
}

export function EventsBlogPage({ posts, bannerImg }: { posts: BlogPost[]; bannerImg: string }) {
  const eventPosts = [...posts].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  function navigate(dir: -1 | 1) {
    setActiveIndex((i) => {
      if (i === null) return i;
      const next = i + dir;
      if (next < 0 || next >= eventPosts.length) return i;
      return next;
    });
  }

  return (
    <main className="bg-[#f4efe7]">
      <div className="relative h-[280px] sm:h-[340px] overflow-hidden">
        <img src={bannerImg} alt="Events Blog" className="absolute inset-0 size-full object-cover" />
        <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
          <h1 className={`${fraunces()} text-white text-[36px] sm:text-[52px] font-semibold capitalize`} style={{ fontVariationSettings: '"SOFT" 0, "WONK" 1' }}>
            Events Blog
          </h1>
        </div>
      </div>

      <section className="py-10 px-6 text-center">
        <SectionLabel text="What We've Done" />
        <p className={`${inter()} text-[#1e1e1e]/70 text-[17px] max-w-[640px] mx-auto mt-2`}>
          A look back at the events we've run — with the stories and photos from each one.
        </p>
      </section>

      <section className="pb-20 px-6">
        <div className="max-w-[1200px] mx-auto grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 items-stretch">
          {eventPosts.map((p, i) => (
            <div key={p.id} className="rounded-2xl overflow-hidden group cursor-pointer h-full flex flex-col">
              <div className="h-[220px] shrink-0 overflow-hidden rounded-t-2xl bg-[#a35848]/20">
                {p.coverImage && (
                  <img src={p.coverImage} alt={p.title} className="size-full object-cover group-hover:scale-105 transition-transform duration-500" />
                )}
              </div>
              <div className="bg-[#a35848] p-6 rounded-b-2xl flex flex-col flex-1">
                <p className={`${inter()} text-[#f4efe7] text-[22px] font-semibold capitalize line-clamp-2`}>{p.title}</p>
                <p className={`${inter()} text-[#f4efe7]/85 text-[17px] leading-relaxed mt-3 line-clamp-3`}>{p.excerpt}</p>
                <button
                  onClick={() => setActiveIndex(i)}
                  className={`${inter()} text-[#f4efe7] text-[14px] font-semibold mt-auto pt-4 opacity-85 hover:opacity-100 transition-opacity cursor-pointer`}
                >
                  Read More →
                </button>
              </div>
            </div>
          ))}
        </div>

        {eventPosts.length === 0 && (
          <div className="text-center py-20">
            <p className={`${inter()} text-[#1e1e1e]/50 text-[18px]`}>Something big is cooking! Check back soon.</p>
          </div>
        )}
      </section>

      {activeIndex !== null && eventPosts[activeIndex] && (
        <BlogDetailModal
          post={eventPosts[activeIndex]}
          categoryLabel="Events Blog"
          onClose={() => setActiveIndex(null)}
          onNavigate={navigate}
        />
      )}
    </main>
  );
}
