'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { api } from '@/lib/api/client';
import { ResponseSummary, StatsResponse } from '@/lib/api/types';

export function ResultsClient({ formId }: { formId: string }) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const [responses, setResponses] = useState<ResponseSummary[]>([]);
  const [stats, setStats] = useState<StatsResponse | null>(null);
  
  const [selectedResponse, setSelectedResponse] = useState<ResponseSummary | null>(null);

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        
        const [responsesData, statsData] = await Promise.all([
          api.get(`/api/v1/forms/${formId}/responses`),
          api.get(`/api/v1/forms/${formId}/stats`)
        ]);
        
        setResponses(responsesData as ResponseSummary[]);
        setStats(statsData as StatsResponse);
      } catch (err: unknown) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const e = err as any;
        setError(e.message || 'Failed to load results');
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [formId]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-8">
        <div className="text-red-500 mb-4">{error}</div>
        <Link href={`/forms/${formId}/builder`} className="text-blue-600 hover:underline">
          Back to Builder
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-gray-900">Form Results</h1>
          <p className="text-sm text-gray-500">{responses.length} response{responses.length !== 1 && 's'}</p>
        </div>
        <Link 
          href={`/forms/${formId}/builder`}
          className="text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors bg-gray-100 hover:bg-gray-200 px-4 py-2 rounded-md"
        >
          Back to Builder
        </Link>
      </header>

      <main className="flex-1 p-6 max-w-7xl mx-auto w-full grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Responses List */}
        <div className="col-span-1 flex flex-col space-y-6">
          <section className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden flex flex-col">
            <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
              <h2 className="text-lg font-medium text-gray-900">Responses</h2>
            </div>
            
            {responses.length === 0 ? (
              <div className="p-6 text-center text-gray-500">
                No responses yet.
              </div>
            ) : (
              <div className="overflow-y-auto max-h-[600px] flex flex-col divide-y divide-gray-100">
                {responses.map((resp) => {
                  const isSelected = selectedResponse?.id === resp.id;
                  return (
                    <button
                      key={resp.id}
                      onClick={() => setSelectedResponse(resp)}
                      className={`text-left px-6 py-4 hover:bg-gray-50 transition-colors flex flex-col ${isSelected ? 'bg-blue-50/50 border-l-4 border-blue-500' : 'border-l-4 border-transparent'}`}
                    >
                      <span className="text-sm font-medium text-gray-900">
                        {new Date(resp.submitted_at).toLocaleString()}
                      </span>
                      <span className="text-sm text-gray-500 mt-1">
                        {resp.answers.length} answer{resp.answers.length !== 1 && 's'}
                      </span>
                    </button>
                  );
                })}
              </div>
            )}
          </section>

          {/* Individual Response View */}
          {selectedResponse && (
            <section className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-200 bg-gray-50 flex justify-between items-center">
                <h2 className="text-lg font-medium text-gray-900">Response Details</h2>
                <button 
                  onClick={() => setSelectedResponse(null)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              <div className="p-6 space-y-6">
                {selectedResponse.answers.map((ans, idx) => (
                  <div key={idx} className="flex flex-col">
                    <div className="flex items-center space-x-2 mb-1">
                      <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">{ans.question_type.replace('_', ' ')}</span>
                    </div>
                    <span className="text-sm font-medium text-gray-900 mb-2">{ans.question_title}</span>
                    <div className="text-sm text-gray-700 bg-gray-50 p-3 rounded-md border border-gray-100 whitespace-pre-wrap">
                      {String(ans.value)}
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}
        </div>

        {/* Right Column: Stats */}
        <div className="col-span-1 lg:col-span-2">
          <section className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
              <h2 className="text-lg font-medium text-gray-900">Summary Statistics</h2>
            </div>
            
            {responses.length === 0 ? (
              <div className="p-6 text-center text-gray-500">
                Waiting for responses to generate statistics.
              </div>
            ) : (
              <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                {stats?.questions.map((qStat) => (
                  <div key={qStat.question_id} className="border border-gray-100 rounded-lg p-5 flex flex-col bg-gray-50/50">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="text-sm font-medium text-gray-900 line-clamp-2">{qStat.question_title}</h3>
                    </div>
                    <span className="text-xs text-gray-500 mb-4 uppercase tracking-wide">{qStat.question_type.replace('_', ' ')} &middot; {qStat.response_count} responses</span>
                    
                    <div className="flex-1">
                      {['SHORT_TEXT', 'LONG_TEXT', 'EMAIL'].includes(qStat.question_type) && (
                        <div className="text-sm text-gray-600 flex items-center justify-center h-full border border-dashed border-gray-300 rounded bg-white">
                          <span className="text-2xl font-semibold text-gray-900 mr-2">{qStat.response_count}</span> text responses
                        </div>
                      )}
                      
                      {qStat.question_type === 'NUMBER' && (
                        <div className="grid grid-cols-3 gap-2">
                          <div className="bg-white border border-gray-200 rounded p-2 text-center">
                            <div className="text-xs text-gray-500 mb-1">Avg</div>
                            <div className="font-medium">{qStat.average !== undefined ? qStat.average.toFixed(2) : '-'}</div>
                          </div>
                          <div className="bg-white border border-gray-200 rounded p-2 text-center">
                            <div className="text-xs text-gray-500 mb-1">Min</div>
                            <div className="font-medium">{qStat.minimum ?? '-'}</div>
                          </div>
                          <div className="bg-white border border-gray-200 rounded p-2 text-center">
                            <div className="text-xs text-gray-500 mb-1">Max</div>
                            <div className="font-medium">{qStat.maximum ?? '-'}</div>
                          </div>
                        </div>
                      )}
                      
                      {qStat.question_type === 'YES_NO' && (
                        <div className="space-y-2">
                          <div className="flex items-center justify-between text-sm">
                            <span className="font-medium text-gray-700">Yes</span>
                            <span className="text-gray-900 font-semibold">{qStat.true_count || 0}</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div className="bg-blue-500 h-2 rounded-full" style={{ width: `${qStat.response_count ? ((qStat.true_count || 0) / qStat.response_count) * 100 : 0}%` }}></div>
                          </div>
                          <div className="flex items-center justify-between text-sm mt-3">
                            <span className="font-medium text-gray-700">No</span>
                            <span className="text-gray-900 font-semibold">{qStat.false_count || 0}</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div className="bg-gray-400 h-2 rounded-full" style={{ width: `${qStat.response_count ? ((qStat.false_count || 0) / qStat.response_count) * 100 : 0}%` }}></div>
                          </div>
                        </div>
                      )}
                      
                      {['MULTIPLE_CHOICE', 'DROPDOWN'].includes(qStat.question_type) && qStat.choice_counts && (
                        <div className="space-y-3">
                          {Object.entries(qStat.choice_counts)
                            .sort((a, b) => b[1] - a[1])
                            .map(([choice, count], idx) => (
                              <div key={idx} className="flex flex-col">
                                <div className="flex items-center justify-between text-sm mb-1">
                                  <span className="font-medium text-gray-700 truncate mr-2" title={choice}>{choice}</span>
                                  <span className="text-gray-900 font-semibold">{count}</span>
                                </div>
                                <div className="w-full bg-gray-200 rounded-full h-1.5">
                                  <div className="bg-indigo-500 h-1.5 rounded-full" style={{ width: `${qStat.response_count ? (count / qStat.response_count) * 100 : 0}%` }}></div>
                                </div>
                              </div>
                            ))}
                        </div>
                      )}
                      
                      {qStat.question_type === 'RATING' && qStat.distribution && (
                        <div className="flex flex-col h-full">
                          <div className="text-center mb-3">
                            <span className="text-3xl font-bold text-gray-900">{qStat.average?.toFixed(1) || '-'}</span>
                            <span className="text-gray-500 text-sm ml-1">avg rating</span>
                          </div>
                          <div className="space-y-1 mt-auto">
                            {Object.entries(qStat.distribution)
                              .sort((a, b) => Number(b[0]) - Number(a[0])) // Sort descending by rating
                              .map(([rating, count], idx) => (
                                <div key={idx} className="flex items-center text-xs">
                                  <span className="w-4 flex-shrink-0 text-gray-600">{rating}</span>
                                  <span className="text-yellow-400 mr-2 text-[10px]">★</span>
                                  <div className="flex-1 bg-gray-200 rounded-full h-1.5 mr-2">
                                    <div className="bg-yellow-400 h-1.5 rounded-full" style={{ width: `${qStat.response_count ? (count / qStat.response_count) * 100 : 0}%` }}></div>
                                  </div>
                                  <span className="w-4 text-right text-gray-500">{count}</span>
                                </div>
                              ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
        </div>
      </main>
    </div>
  );
}
