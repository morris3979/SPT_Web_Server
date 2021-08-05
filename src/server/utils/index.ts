import { exec } from "child_process";
import { writeFileSync } from "fs";
import { getRepository } from "typeorm";
import { TreatmentSite } from "../entity/TreatmentSite";

export async function saveTreatmentSitesToJson() {
  const treatmentSites = await getRepository(TreatmentSite).find({
    relations: ["treatmentSeats", "treatmentSeats.treatmentItems"],
  });

  writeFileSync(
    "maintain_data.json",
    JSON.stringify(
      treatmentSites.map((site) => {
        site.treatmentSeats = site.treatmentSeats.map((seat) => {
          seat.treatmentItems.sort(
            (l, r) =>
              Number(l.treatmentCode.replace("PTS", "").split("-")[0]) -
              Number(r.treatmentCode.replace("PTS", "").split("-")[0])
          );
          return seat;
        });
        return site;
      })
    )
  );

  exec(`python ./schedule/test4-2.py`, (err, stdout, stderr) =>
    console.log(`err:${err}\nstdout;${stdout}`)
  );
}
