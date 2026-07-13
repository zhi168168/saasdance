"use client";

import { useEffect, useState } from "react";

import SiteCard from "./site-card";

import { SiteState } from "@/lib/constants";
import { Site } from "@/models/site";

const localSitesKey = "saasDanceLocalSites";

function getLocalSites(): Site[] {
  try {
    return JSON.parse(window.localStorage.getItem(localSitesKey) || "[]");
  } catch {
    return [];
  }
}

export default function LocalApprovedSites() {
  const [sites, setSites] = useState<Site[]>([]);

  useEffect(() => {
    setSites(getLocalSites().filter((site) => site.state === SiteState.published));
  }, []);

  if (!sites.length) {
    return null;
  }

  return (
    <div className="mt-10 sm:mt-16" id="local-approved">
      <h2 className="text-2xl font-bold">Approved Submissions</h2>
      <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
        {sites.map((site) => (
          <SiteCard key={site._id} site={site} />
        ))}
      </div>
    </div>
  );
}
