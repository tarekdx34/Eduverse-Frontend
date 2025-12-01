import { useLanguage } from '../contexts/LanguageContext';

export function GamificationSection() {
  const { t } = useLanguage();

  const leaderboard = [
    {
      rank: 1,
      name: 'Tarek Mohamed',
      xp: '12,450 XP',
      image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDFaZxxzkIFF_Bg73OV5kyL3bwbKFCZci0VtW95SV20HZAgUAXVPPaYRXfyHxXdUsEQiMQKbMv_C8hN2Un2VoFvSgp0npdJddXP1UHpEUwzL74a6MtbdE-ouCw4Zm1o5hCVr3gj-urdAVZRD8Mg_dr2eovnrfgahY2-jMdjLUp1SojmIJiBiMgwPFZ4tdkHwUGlRu1I8OB_kuJ-va5y9OAib5IVrWVSkZLLEaZq0NZliRHJLNaEr2qwmE251sB8hZsm3Zsh1z2o1tM',
      premium: true,
    },
    {
      rank: 2,
      name: 'Amir Mohamed',
      xp: '11,980 XP',
      image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAWpL1MaMbDUQkr4mOIO83dTcsB-Vd2YMBKzBWY9ONAjhamRH4TwcWsR8qU26kjqkD3ebJFEFAI-Xre_0dw9zkvZGozM_IrMAAWaCBDRbBZmseLW_mvJ8p4stYUYU_FKt5SaP7ubr8CuG3vSyeMFVbddLzsOE_YsohhxBsZhkWMgq_KN3CCMpxrxJVP27CvT1cBp-n7s6qHq0A0w3PndbkbNxjPpYUt_GDqdG_hZ-Ufhs-HWCl1QEnIx284Bp9v7GqffpbNLoMNfs4',
      premium: false,
    },
    {
      rank: 3,
      name: 'Awab',
      xp: '11,230 XP',
      image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAaxwE-P3xrcD24bynl-K13gpChyOeTGGM1RaeYhdtKmAgGeHyaf31cQabY8A8zNtruGK2wYiVlbgrlOwd3BRXfE7FuY_nmisIPh8D2EdsYUkpt-xfmMbWZb-B_iqIWII3H2_ZkGIkcql4BDftsLW_jAStg1NZcX4scoQXuSdbXv7vKq-_mAKD_javxTPeE_M-_Jwqjq6ykmlw9KGJ93DJQo-IXI5L-QLD9XHQgM5dtksArSyflQjT6uX03GsK1MHoSU1uVuB5vNB4',
      premium: false,
    },
  ];

  const achievements = [
    {
      name: t('Stellar Starter', 'بداية نجمية'),
      icon: 'rocket_launch',
      background: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBOL_LJ5xAsBPDc0bfLlxpDneOgWb0KOAKwmDZ1g3jZAcrSPZ8iNU0JH0sIMozVJG6JP5EMwgYUgcaDU1Hn6cIenI1yfMOmlilJwP_86Sg4ceGUcja47VjLneeE0WRDc8Rhcn04DMwgKDTYQQkqVQNLDEaYM-w_pO5_tq29-_NUA53uM2WgRvX6_Kytjv-6yKInDVuasDA6JYjH_ff9Je4foYjcw-5Ycu6SrIr-ynIfKnzBK7tNz7jJiDanlwmNmggYPk2AwxzXQJY',
      locked: false,
    },
    {
      name: t('Quantum Thinker', 'مفكر الكم'),
      icon: 'psychology',
      background: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAEn4SbHxMckHHtsXSJXaBOeDuBIyMOpxzm3kY00-rn4r33XzlDUS1nICY0qADqMWuK35cDYJ6sLAAVHRNh9UwUjbz04EWMtireVzNeKAf-wqu8YjaMy8hgKMltSLBexTAp-Aze6WbuxGHNTvIpzuTodLvqekrfk58qhd7Jxb3uhLW1pxjPHiP9TnB0NtjTc_j8e1rhLQnhPV-YhqlzXmLnzOQ2CH4Yx5AIuABHphT1hY-4SwQUIM0WPiBIuXAwbEgIDWZGjyETGWk',
      locked: false,
    },
    {
      name: t('Collaboration Champ', 'بطل التعاون'),
      icon: 'groups',
      background: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDo2vvwaf5BTKP8vTfcvlgeyT55br10n6IV1OZyA7l4UW6CXhh0bla_9K65y1CsMVIIGqq8WwUQdSrQe8q4hyTKpNWLmFXFcRJwQMV8hONNTxKI3eR_WngIC_p1d9lkGDra0zCw2Ai2hF0rZ2nD1E-NSGh013atqwog_ESHeTkUercWZBbhl37fza5g7ciLvXK-imMqSzEkL3shgRl2SK90ZN9dd1omB0mOKAVHBDUvlLOQYzjQSSKKY7vejCZMjshZ1G4w2J1NF00',
      locked: false,
    },
  ];

  return (
    <section className="relative flex min-h-screen w-full flex-col items-center justify-center p-4 sm:p-6 md:p-8">
      <div className="w-full max-w-5xl">
        {/* Section Header & Body Text */}
        <div className="text-center mb-12">
          <h2 className="text-foreground text-3xl md:text-4xl font-bold leading-tight tracking-tight">
            {t('Make Learning an Adventure', 'اجعل التعلم مغامرة')}
          </h2>
          <p className="text-muted-foreground text-lg font-normal leading-normal max-w-3xl mx-auto mt-4">
            {t(
              'Our gamification system transforms education into an engaging experience, motivating you to excel through friendly competition and rewarding achievements.',
              'نظام المكافآت لدينا يحول التعليم إلى تجربة جذابة، مما يحفزك على التميز من خلال المنافسة الودية والإنجازات المجزية.'
            )}
          </p>
        </div>

        {/* Main Grid Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column: Leaderboard Card */}
          <div className="lg:col-span-1">
            <div className="flex flex-col items-stretch justify-start rounded-xl shadow-sm border border-border bg-card h-full p-6">
              <div className="flex items-center gap-3 mb-4">
                <span className="material-symbols-outlined text-primary text-2xl">trophy</span>
                <p className="text-foreground text-lg font-bold leading-tight">
                  {t('Leaderboard', 'لوحة الصدارة')}
                </p>
              </div>
              <p className="text-muted-foreground text-base font-normal leading-normal mb-6">
                {t('See who\'s leading the charge this week.', 'اعرف من يتصدر هذا الأسبوع.')}
              </p>
              <div className="flex flex-col gap-4 grow">
                {leaderboard.map((student) => (
                  <div key={student.rank} className="flex items-center gap-4">
                    <span className="text-muted-foreground font-bold text-lg w-4">
                      {student.rank}
                    </span>
                    <img
                      className="w-10 h-10 rounded-full object-cover"
                      src={student.image}
                      alt={student.name}
                    />
                    <div className="flex-1">
                      <p className="text-foreground font-medium">{student.name}</p>
                      <p
                        className={`text-sm ${
                          student.premium
                            ? 'text-primary font-bold'
                            : 'text-muted-foreground'
                        }`}
                      >
                        {student.xp}
                      </p>
                    </div>
                    {student.premium && (
                      <span className="material-symbols-outlined text-amber-400">
                        workspace_premium
                      </span>
                    )}
                  </div>
                ))}
              </div>
              <button className="flex mt-6 min-w-[84px] w-full max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-full h-10 px-4 bg-primary/10 dark:bg-primary/20 text-primary text-sm font-medium leading-normal hover:bg-primary/20 transition-colors">
                <span className="truncate">
                  {t('View Full Leaderboard', 'عرض لوحة الصدارة الكاملة')}
                </span>
              </button>
            </div>
          </div>

          {/* Right Column: Achievements & Progress */}
          <div className="lg:col-span-2 flex flex-col gap-8">
            {/* Achievement Badges Card */}
            <div className="p-6 rounded-xl shadow-sm border border-border bg-card">
              <h3 className="text-foreground text-lg font-bold leading-tight mb-4">
                {t('Unlock Your Achievements', 'افتح إنجازاتك')}
              </h3>
              <div className="grid grid-cols-[repeat(auto-fit,minmax(120px,1fr))] gap-4">
                {achievements.map((achievement, index) => (
                  <div
                    key={index}
                    className="flex flex-col gap-3 items-center justify-center aspect-square rounded-full bg-cover bg-center hover:scale-105 transition-transform cursor-pointer"
                    style={{
                      backgroundImage: `linear-gradient(0deg, rgba(20, 20, 20, 0.4) 0%, rgba(20, 20, 20, 0.4) 100%), url('${achievement.background}')`,
                    }}
                  >
                    <span className="material-symbols-outlined text-white text-3xl">
                      {achievement.icon}
                    </span>
                    <p className="text-white text-base font-bold leading-tight w-[80%] text-center line-clamp-2">
                      {achievement.name}
                    </p>
                  </div>
                ))}
                {/* Locked Achievement */}
                <div className="flex flex-col gap-3 items-center justify-center aspect-square rounded-full bg-muted border-2 border-dashed border-border hover:scale-105 transition-transform cursor-pointer">
                  <span className="material-symbols-outlined text-muted-foreground text-3xl">
                    lock
                  </span>
                  <p className="text-muted-foreground text-base font-bold leading-tight w-[80%] text-center line-clamp-2">
                    {t('More to Unlock', 'المزيد قادم')}
                  </p>
                </div>
              </div>
            </div>

            {/* Progress Visualization Card */}
            <div className="p-6 rounded-xl shadow-sm border border-border bg-card">
              <div className="flex flex-col gap-5">
                <div className="flex gap-6 justify-between items-center">
                  <p className="text-foreground text-base font-medium leading-normal">
                    {t('Weekly XP Goal', 'هدف XP الأسبوعي')}
                  </p>
                  <p className="text-primary text-sm font-bold leading-normal">750 / 1000 XP</p>
                </div>
                <div className="rounded-full bg-muted">
                  <div
                    className="h-2 rounded-full bg-primary transition-all duration-500"
                    style={{ width: '75%' }}
                  ></div>
                </div>
                <div className="flex justify-between items-center">
                  <p className="text-muted-foreground text-sm font-normal leading-normal">
                    {t('Great progress! Just 250 XP to the next level.', 'تقدم رائع! يتبقى 250 XP للمستوى التالي.')}
                  </p>
                  <span className="flex items-center gap-1 text-green-500 text-sm font-medium">
                    <span className="material-symbols-outlined text-base">trending_up</span>
                    {t('Level Up!', 'مستوى جديد!')}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

