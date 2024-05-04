"use server";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faDumbbell } from "@fortawesome/free-solid-svg-icons/faDumbbell";
import { faArrowUpRightDots } from "@fortawesome/free-solid-svg-icons/faArrowUpRightDots";
import { faCertificate } from "@fortawesome/free-solid-svg-icons/faCertificate";

function Achievement({ children }) {
  return (
    <li className="carousel-item card text-center flex flex-col">{children}</li>
  );
}

export default async function Growth() {
  return (
    <main className="h-content flex flex-col justfiy-center items-center px-4 gap-y-4 overflow-hidden">
      <div className="w-full ml-3" role="group">
        <h3 className="font-bold text-3xl mt-4">Your Growth</h3>
        <subtitle className="text-slate-300 ml-2 font-semibold">
          Progress to date
        </subtitle>
        <ul className="stats stats-vertical md:stats-horizontal w-full md:max-w-[60%] py-4 shadow-md overflow-hidden">
          <li className="stat">
            <div className="stat-title">Total Daily Pushups</div>
            <div className="flex flex-row justify-between stat-value text-primary">
              65
              <div className="stat-figure text-primary">
                <FontAwesomeIcon icon={faDumbbell} className="w-8 h-8" />
              </div>
            </div>
            <div className="stat-desc">21% more than last week</div>
          </li>
          <li className="stat">
            <div className="stat-title">Times Goal Reached</div>
            <div className="flex flex-row justify-between stat-value text-primary">
              528
              <div className="stat-figure text-primary">
                <FontAwesomeIcon
                  icon={faArrowUpRightDots}
                  className="w-8 h-8"
                />
              </div>
            </div>
            <div className="stat-desc">15% more than last week</div>
          </li>
        </ul>
      </div>
      <div
        className="flex flex-col self-start max-w-full rounded-box ml-3"
        role="group"
      >
        <h3 className="font-bold text-3xl">Your achievements</h3>
        <subtitle className="text-slate-300 ml-2 font-semibold">
          Accomplishments to date
        </subtitle>
        <ul className="carousel mt-4 font-semibold">
          <Achievement>
            <FontAwesomeIcon icon={faCertificate} />
            <div className="card-body">
              <p>
                10 Exercise <br /> Streak
              </p>
            </div>
          </Achievement>
          <Achievement>
            <FontAwesomeIcon icon={faCertificate} />
            <div className="card-body">
              <p>
                15 Exercise <br /> Streak
              </p>
            </div>
          </Achievement>
          <Achievement>
            <FontAwesomeIcon icon={faCertificate} />
            <div className="card-body">
              <p>
                20 Exercise <br /> Streak
              </p>
            </div>
          </Achievement>
          <Achievement>
            <FontAwesomeIcon icon={faCertificate} />
            <div className="card-body">
              <p>
                25 Exercise <br /> Streak
              </p>
            </div>
          </Achievement>
          <Achievement>
            <FontAwesomeIcon icon={faCertificate} />
            <div className="card-body">
              <p>
                30 Exercise <br /> Streak
              </p>
            </div>
          </Achievement>
        </ul>
      </div>
    </main>
  );
}
