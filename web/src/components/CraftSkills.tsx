"use client";

import { useState } from "react";
import { SKILL_CATEGORIES } from "@/hooks/useInkWorld";

/* The Craft section — category buttons + declaratively rendered skill
   tags. Mirrors script.js section 10: category switching, skill
   discovery (hover/focus/click → is-discovered + sparkleAt), matching
   the markup/classes consumed by site.css. */
export default function CraftSkills() {
  const [activeKey, setActiveKey] = useState(SKILL_CATEGORIES[0].key);
  const [discovered, setDiscovered] = useState<Record<string, boolean>>({});

  const category = SKILL_CATEGORIES.find((c) => c.key === activeKey) ?? SKILL_CATEGORIES[0];

  function isCoarse() {
    return typeof window !== "undefined" && window.matchMedia("(pointer: coarse)").matches;
  }

  function discover(id: string, el: HTMLElement) {
    if (discovered[id]) return;
    setDiscovered((prev) => ({ ...prev, [id]: true }));
    if (typeof window !== "undefined" && window.InkWorld && !isCoarse()) {
      const r = el.getBoundingClientRect();
      window.InkWorld.sparkleAt(r.left + 10, r.top + r.height / 2);
    }
  }

  function switchCategory(key: string) {
    setActiveKey(key);
    // Switching categories reveals a fresh set of (undiscovered) tags.
    setDiscovered({});
  }

  return (
    <div className="craft-layout">
      <div className="craft-categories">
        <ul id="craft-category-list">
          {SKILL_CATEGORIES.map((c) => {
            const active = c.key === activeKey;
            const label =
              c.key === "ai"
                ? "AI"
                : c.key.charAt(0).toUpperCase() + c.key.slice(1);
            return (
              <li className="reveal" key={c.key}>
                <button
                  type="button"
                  className={"craft-cat-btn cursor-hover" + (active ? " is-active" : "")}
                  data-category={c.key}
                  aria-pressed={active}
                  onClick={() => switchCategory(c.key)}
                >
                  {label}
                </button>
              </li>
            );
          })}
        </ul>
      </div>

      <div className="craft-detail">
        <div id="craft-skill-panel" className="craft-skill-panel">
          <div className="craft-skill-tags" key={activeKey}>
            {category.skills.map((skill, i) => {
              const id = activeKey + ":" + skill.name;
              const isDiscovered = !!discovered[id];
              return (
                <span
                  key={id}
                  className={"craft-skill-tag cursor-hover" + (isDiscovered ? " is-discovered" : "")}
                  style={{ animationDelay: i * 0.05 + "s" }}
                  tabIndex={0}
                  role="button"
                  aria-expanded={isDiscovered}
                  onMouseEnter={(e) => discover(id, e.currentTarget)}
                  onFocus={(e) => discover(id, e.currentTarget)}
                  onClick={(e) => discover(id, e.currentTarget)}
                >
                  <span className="skill-symbol" aria-hidden="true">
                    {skill.symbol}
                  </span>
                  {skill.name}
                  <span className="skill-note">{skill.note}</span>
                </span>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
