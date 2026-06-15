"use client";
import { mlbbBracket } from "@/data/tournaments";
import { BracketRound } from "@/types/tournament";

function BracketRoundCol({ round, roundIndex }: { round: BracketRound; roundIndex: number }) {
  const topOffset = roundIndex === 0 ? 0 : roundIndex === 1 ? 42 : 130;

  return (
    <div className="flex flex-col gap-0 min-w-[170px]">
      <div className="text-[10px] uppercase tracking-[1.5px] text-[#808080] mb-3 text-center">
        {round.title}
      </div>
      <div className="flex flex-col" style={{ gap: roundIndex === 0 ? "16px" : roundIndex === 1 ? "88px" : "0" }}>
        {round.matches.map((match) => (
          <div key={match.id} style={{ marginTop: roundIndex > 0 && match === round.matches[0] ? `${topOffset}px` : undefined }}>
            <div className="bg-[#232323] border border-[#2E2E2E] rounded-lg overflow-hidden">
              <div className={`flex items-center justify-between px-3 py-2 text-xs ${match.teamA.isWinner ? "text-[#00F5D4] bg-[#00F5D4]/[0.05]" : "text-[#B8B8B8]"}`}>
                <span className="font-medium">{match.teamA.name}</span>
                {match.teamA.score !== undefined && (
                  <span className={`font-bold ml-2 ${match.teamA.isWinner ? "text-[#00F5D4]" : "text-[#808080]"}`}>{match.teamA.score}</span>
                )}
              </div>
              <div className="h-px bg-[#2E2E2E]" />
              <div className={`flex items-center justify-between px-3 py-2 text-xs ${match.teamB.isWinner ? "text-[#00F5D4] bg-[#00F5D4]/[0.05]" : "text-[#B8B8B8]"}`}>
                <span className="font-medium">{match.teamB.name}</span>
                {match.teamB.score !== undefined && (
                  <span className={`font-bold ml-2 ${match.teamB.isWinner ? "text-[#00F5D4]" : "text-[#808080]"}`}>{match.teamB.score}</span>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function BracketManagementModule({ showActions = true }: { showActions?: boolean }) {
  return (
    <div>
      {showActions && (
        <div className="flex gap-2 mb-5">
          <button className="bg-[#FF4655] hover:bg-[#E53E4D] text-white text-xs font-semibold uppercase tracking-widest px-4 py-2 rounded-lg transition-colors">Generate Bracket</button>
          <button className="border border-[#2E2E2E] text-[#808080] hover:text-white hover:border-[#808080] text-xs uppercase tracking-widest px-4 py-2 rounded-lg transition-all">Update Winner</button>
        </div>
      )}
      <div className="overflow-x-auto pb-4">
        <div className="flex gap-8 items-start min-w-max">
          {mlbbBracket.map((round, i) => (
            <BracketRoundCol key={round.title} round={round} roundIndex={i} />
          ))}
        </div>
      </div>
    </div>
  );
}
