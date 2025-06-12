import  { useState } from 'react';
import Nav from './Nav';
import Footerx from './Footerx';
import { FaGamepad } from 'react-icons/fa';

const HowToPlay = () => {
  const [language, setLanguage] = useState('en');

  const content = {
    en: {
      title: 'How to Play',
      steps: [
        'Sign Up and Log In: Create your account and get started in seconds.',
        'Pick a Game Room: Choose your preferred entry fee - 10 birr, 25 birr, 50 birr, or 100 birr—and join the fun.',
        'Buy Your Bingo Cards: Grab as many cards as you like to boost your chances.',
        'Learn the Goal: Aim to complete patterns like rows, full houses, or special shapes to win.',
        'Start Playing: Numbers are called randomly—watch them appear on your card.',
        'Mark Your Numbers: The system automatically tracks your matches, so sit back and enjoy.',
        'Win and Celebrate: If you match the winning pattern, you’ll be notified instantly, and prizes are credited right away.',
        'Explore More: Try other rooms with unique styles and jackpot prizes.',
        'Play Smart: Set spending limits and enjoy responsibly.',
        'Join the Fun Anytime: Games run around the clock—there’s always a chance to win!',
        'Our platform makes playing bingo easy, exciting, and rewarding for everyone!',
      ],
      rules: [
        'Follow the instructions provided in the game.',
        'Respect other players and play fair.',
        'Have fun and enjoy the game!',
      ],
    
    bonus: [
      
'1. Earn points by playing and participating in the game.',
'2. Stay active to climb the leaderboard.',
'3. Keep an eye on the bonus periods to maximize your chances.',
'Make the most of these opportunities to win exciting prizes. Good luck and have fun!',

    ],
      
    },
    am: {
      title: 'እንዴት ቢንጎ መጫወት እንደሚቻል',
      steps: [
        'ይመዝገቡ እና ይግቡ፡ መለያዎን ይፍጠሩ እና በሰከንዶች ውስጥ ይጀምሩ።',
        'የጨዋታ ክፍል ይምረጡ፡ የሚመርጡትን የመግቢያ ክፍያ ይምረጡ - 10 ብር፣ 25 ብር፣ 50 ብር ወይም 100 ብር - እና መዝናኛውን ይቀላቀሉ።',
        'የእርስዎን የቢንጎ ካርዶች ይግዙ፡ እድሎችዎን ለማሳደግ የፈለጉትን ያህል ካርዶችን ይያዙ።',
        'ግቡን ይማሩ፡ ለማሸነፍ እንደ ረድፎች፣ ሙሉ ቤቶች ወይም ልዩ ቅርጾችን ማጠናቀቅ ዓላማ ያድርጉ።',
        'መጫወት ይጀምሩ፡ ቁጥሮች በዘፈቀደ ይጠራሉ—በካርድዎ ላይ ሲታዩ ይመልከቱ።',
        'ቁጥሮችዎን ምልክት ያድርጉበት፡ ስርዓቱ ግጥሚያዎችዎን በራሱ ይከታተላል፣ እየተከታተሉ ይደሰቱ።',
        'ያሸንፉ እና ያክብሩ፡ ከአሸናፊው ስርዓተ-ጥለት ጋር የሚዛመዱ ከሆነ፣ ወዲያውኑ ማሳወቂያ ይደርሰዎታል፣ እና ሽልማቶች ወዲያውኑ ይቆጠራሉ።',
        'ተጨማሪ ያስሱ፡ ሌሎች ክፍሎችን በማሰስ እድሎን የሞክሩ።',
        'በሃላፊነት ይጫወቱ፡ የወጪ ገደቦችን ያቀናብሩ እና በኃላፊነት ይደሰቱ።',
        'ደስታውን በማንኛውም ጊዜ ይቀላቀሉ፡ ጨዋታዎች ሌት ተቀን ይሰራሉ—ሁልጊዜም የማሸነፍ እድል አለ!',
        'የእኛ መድረክ ቢንጎን መጫወት ቀላል፣ አስደሳች እና ለሁሉም የሚክስ ያደርገዋል።',
      ],
      rules: [
        'እቲ መመሪያ ተኸታተል።',
        'እቲ ካልእ ተጻዋቲ ኣክብርካ ብቅንነት ተጻወት።',
        'ተዓወትን ተሓጐስ።',
      ],
      bonus: [
      'በመጫወት እና በጨዋታው ውስጥ በመሳተፍ ነጥብ ያግኙ።',  
'የመሪዎች ሰሌዳውን ለመውጣት ንቁ ይሁኑ።',  
'እድልዎን ከፍ ለማድረግ የቦነስ ወቅቶችን ይከታተሉ።',  
'አስደሳች ሽልማቶችን ለማሸነፍ እነዚህን እድሎች በተቻለ መጠን ይጠቀሙ።',  
'መልካም ዕድል እና ተዝናኑ!',  

        

        
            ],
    },
    om: {
      title: 'Akkaataa itti Taphattan',
      steps: [
        'Sign Up fi Log In: Akkaawuntii keessan uumuun sekondii muraasa keessatti jalqabaa.',
        'Kutaa Taphaa Filadhu: Kaffaltii seensaa filadhu - birrii 10, birrii 25, birrii 50, ykn birrii 100-fi bashannana kana irratti hirmaadhu.',
        'Kaardii Bingo Keessan Bitadhaa: Carraa keessan guddisuuf kaardii hamma barbaaddan qabadhaa.',
        'Galma Baradhu: Mo’achuuf paateenoota akka tarree, mana guutuu, ykn boca addaa xumuruuf kaayyeffadhu.',
        'Taphachuu Jalqabuu: Lakkoofsi akka tasaa waamama—kaardii kee irratti akka mul’atan ilaali.',
        'Lakkoofsa Keessan Mallatteessi: Sirnichi ofumaan walsimsiisaa keessan hordofa, kanaaf taa\'aatii itti gammadaa.',
        'Mo’achuu fi Kabajachuu: Yoo akkaataa mo’achuu wajjin walsimsiiftan battalumatti isin beeksifna, badhaasni immoo battalumatti isiniif kennama.',
        'Dabalata qoradhu: Kutaawwan biroo akkaataa addaa fi badhaasa jackpot qaban yaali.',
        'Play Smart: Daangaa baasii kaa\'aatii itti gaafatamummaadhaan gammadaa.',
        'Yeroo Kamittuu Bashannanaatti Hirmaachuu: Taphoonni sa’aatii guutuu fiiga—yeroo hunda carraan mo’achuu ni jira!',
        'Waltajjiin keenya bingo taphachuun nama hundaaf salphaa, gammachiisaa fi badhaasa akka ta\'u taasisa!',
      ],
      rules: [
        'Akkaataa itti taphattan hordofaa.',
        'Taphattoota biroo kabajaa fi sirnaan taphadhaa.',
        'Gammadaa fi taphadhaa!',
      ],
      bonus: [
      
        'Tapha taphachuu fi hirmaachuudhaan qabxii argachuu.',  
'Gabatee dursaa ol ba’uu irratti of eeggannoo gochuu.',  
'Carraa kee guddisuuf yeroo bonasii hordofi.',  
'Carraawwan kana akka gaariitti fayyadamuun badhaasa gammachiisaa injifadhu.',  
'Carraa gaarii fi bashannanaa!', 
        
            ],
    },
    ti: {
      title: 'ቢንጎ ብኸመይ ከም እትጻወት',
      steps: [
        'መዝጊብካ ኣተኣቱ፦ ሕሳብካ ፍጠር እሞ ኣብ ውሽጢ ኻልኢት ጀምር።',
        'ናይ ጸወታ ኽፍሊት ምረጽ ፦ 10 ዶላር 25 ዶላር 50 ዶላር ወይ 100 ዶላር ብምምራጽ ኣብቲ መዘናግዒ ተኻፈለ ።',
        'ካርድታት ቢንጎ ዓድግ፦ ዕድልካ ኽትውስኽ እትደሊ መጠን ካርድታት ሓዝ።',
        'ሸቶኡ ተምሃር፦ ከም መስርዕ ምሉእ ኣባይቲ ወይ ከኣ ንኽትዕወት ዜኽእሎ ፍሉይ ቅርጺ ምውዳእ ዝኣመሰለ ነገራት ሸቶ ግበር።',
        'ጸወታ ጀምር፦ ቍጽርታት ብሃውሪ እዩ ዚጽዋዕ— ኣብ ካርድኻ ኺርአ ኸሎ ርኣዮ።',
        'ቍጽርታትካ ምልክት ግበር፦ እዚ ስርዓት እዚ ነቲ ውድድር ብርእሱ እዩ ዚከታተሎ፣ በዚ ኸምዚ ድማ ክትዘናጋዕ ትኽእል ኢኻ።',
        'ተዓወትን ባህ ምባልን፦ ምስቲ ዓወት ዚሰማማዕ እንተ ዄንካ ብኡንብኡ ኽትነግረካ ኢኻ፣ ሽልማት ድማ ብኡንብኡ ኺቝጸር እዩ።',
        'ዝያዳ ምርምር ግበር፦ ካልእ ክፋላት ብምድህሳስ ዕድልካ ፈትን።',
        'ብሓላፍነት ተጻወት፦ ወጻኢታትካ ደረት ግበረሉ ብሓላፍነት ድማ ተሓጐስ።',
        'ኣብ ዝዀነ ይኹን እዋን ክትዘናጋዕ ጽዓር፦ ጸወታታት ካብ ሰዓት ናብ ሰዓት እዩ ዚውዳእ፣ ኵሉ ሳዕ ንኽትዕወት ዕድል ይህልወካ እዩ።',
        'መድረኽና ቢንጎ ምጽዋት ቀሊልን ባህ ዜብልን ዓስቢ ዘለዎን ይገብሮ።',
      ],
      rules: [
        'እቲ መመሪያ ተኸታተል።',
        'እቲ ካልእ ተጻዋቲ ኣክብርካ ብቅንነት ተጻወት።',
        'ተዓወትን ተሓጐስ።',
      ],
      bonus: [
      
      'ኣብቲ ጸወታ ብምጽዋትን ብምስታፍን ነጥቢ ምእካብ።',  
'ኣብ ምድያብ መሪሕነት ንጡፍ ምዃን።',  
'ዕድልካ ንኽዓቢ ናይ ቦነስ ግዜታት ተኸታተል።',  
'ነዚ ዕድላት እዚ ብዝበለጸ ተጠቒምካ መሳጢ ሽልማት ክትዕወት።',  
'ጽቡቕ ዕድልን ተዘናግዑን!',  
        
            ],
    },
  };

  const handleLanguageChange = (lang) => {
    setLanguage(lang);
  };

  return (
    <div className="bg-[#20446f]/75 min-h-screen flex flex-col text-white">
      <Nav />
      <div className="flex justify-center mt-4">
        <select
          className="px-4 py-2 mx-2 rounded bg-bgdark text-[#20446f] font-semibold"
          value={language}
          onChange={(e) => handleLanguageChange(e.target.value)}
        >
          <option value="en">English</option>
          <option value="am">አማርኛ</option>
          <option value="om">Oromiffa</option>
          <option value="ti">ትግርኛ</option>
        </select>
      </div>
      <div className="flex-grow container mx-auto p-6">
        <div className="bg-bgdark/85 shadow-lg border-bgdark rounded-xl overflow-hidden p-6 mb-6">
          <h1 className="text-4xl font-bold text-[#20446f] mb-4">{content[language].title}</h1>
          <p className="text-[#20446f] mb-4">
            {language === 'en' ? 'Here are the steps to get started:' : language === 'am' ? 'እነሆ መጀመሪያ ለመጀመር ያስፈልጉት እርምጃዎች:' : language === 'om' ? 'Akkaataa itti Taphattan:' : 'እነሆ መጀመሪያ ለመጀመር ያስፈልጉት እርምጃዎች:'}
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {content[language].steps.map((step, index) => (
              <div key={index} className="bg-bgdark p-4 rounded-lg shadow-md hover:shadow-xl transition-shadow">
                <FaGamepad className="text-[#20446f] text-3xl mb-2" />
                <h2 className="text-2xl text-[#20446f] font-semibold mb-2">{`Step ${index + 1}`}</h2>
                <p className="text-[#20446f]">{step}</p>
              </div>
            ))}
          </div>
        </div>
        
        <div className="bg-bgdark/85 shadow-lg border-bgdark rounded-xl overflow-hidden p-6">
          <h2 className="text-3xl font-bold text-[#20446f] mb-4">{language === 'en' ? 'Game Rules' : language === 'am' ? 'የጨዋታ መመሪያዎች' : language === 'om' ? 'Seerota Taphaa' : 'እቲ መመሪያ ተኸታተል።'}</h2>
          <p className="text-[#20446f] mb-4">
            {language === 'en' ? 'Here are the basic rules of the game:' : language === 'am' ? 'እነሆ የጨዋታው መሠረታዊ መመሪያዎች:' : language === 'om' ? 'Akkaataa itti Taphattan:' : 'እቲ መመሪያ ተኸታተል።'}
          </p>
          <ul className="list-disc list-inside text-[#20446f] mb-4">
            {content[language].rules.map((rule, index) => (
              <li key={index} className="mb-2">{rule}</li>
            ))}
          </ul>
        </div>
        </div>

        <div className="flex-grow container mx-auto p-6">
        <div className="bg-bgdark/85 shadow-lg border-bgdark rounded-xl overflow-hidden p-6">
          <h2 className="text-3xl font-bold text-[#20446f] mb-4">{language === 'en' ? 'Bingo Game Bonus System' : language === 'am' ? 'ቢንጎ ጨዋታ ቦነስ ስርዓት' : language === 'om' ? 'Sirna bonasii tapha Bingo' : 'ቢንጎ ጸወታ ቦነስ ስርዓት'}</h2>
          <p className="text-[#20446f] mb-4">
            {language === 'en' ? 'Bingo Game Bonus System' : language === 'am' ? 'ብቁ ማረግያ መስፈርቶች' : language === 'om' ? 'Ulaagaalee gahumsaa' : 'ናይ ብቕዓት ረቛሒታት'}
          </p>
          <ul className="list-disc list-inside text-[#20446f] mb-4">
            {content[language].bonus.map((bonus, index) => (
              <li key={index} className="mb-2">{bonus}</li>
            ))}
          </ul>
        </div>
      </div>
      <Footerx />
    </div>
  );
};

export default HowToPlay;