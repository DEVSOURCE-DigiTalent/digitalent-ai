using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace DigiTalent.Infrastructure.Persistence.Migrations
{
    /// <summary>
    /// Cờ is_final_quiz cho câu hỏi: câu thuộc bài trắc nghiệm cuối khóa của giáo trình 6 lĩnh vực (20 câu mỗi khóa), được
    /// chia vào mô đun có nội dung khớp nhất khi nạp giáo trình (catalog v6, 15/11/2026). Bài khảo sát dùng thử rút các câu này
    /// trước câu ôn tập.
    /// Đánh dấu dữ liệu đã có: mỗi khóa trong <see cref="FinalQuizKeys"/> = md5(câu hỏi ‹US› các phương án xếp theo byte nối
    /// bằng ‹RS› ‹US› phương án đúng) của một câu cuối khóa, so cả phương án vì giáo trình có câu ôn tập trùng chữ câu hỏi với
    /// câu cuối khóa nhưng khác phương án. Bản chép trong mọi tổ chức giữ nguyên chữ nên cùng khóa. Cơ sở dữ liệu chưa nạp
    /// giáo trình thì không có dòng nào khớp.
    /// </summary>
    public partial class AddFinalQuizQuestionFlag : Migration
    {
        private static readonly string[] FinalQuizKeys =
        {
            "009edb653c49ef514efccade8495e555", "00cd90320a3060338aa23aae5abdbfbc", "01fc57eda0d22d83b1198f21e7dd2943", "02858680b08ff6faa78419947836ad81",
            "02a99c6d71bd787a2239c2ada3446bb3", "034cb56a988581801029f692145d1fd8", "03e662927a5d87bd7b9984967ebd2aa0", "0457a13837a9dee65e85043fcea60b05",
            "04acf5bb3ccd8d418d9e27ce4f8d11ff", "0630eb1092455b5242521c02e0fb7c42", "071e27dfb212b5ae0d4183db34d7a7aa", "079c50584db4ded7a3e9494392c0ab8d",
            "08a7345beac36c690a3c8dab11c74f84", "0921c16e90bbd96b762c0cad9a9ec2aa", "093494f53b84697975ea7dc3184af40d", "095de7c04b62319c85b1d0b2802265e2",
            "0b984df8be236256ddc439caadf0b8a1", "0bf5117f768babb7e4a23685447e0215", "0d949668f050a8f0e11ae03e7e9fbdf8", "0de8b21a7c2a7345f0fa85348ded1359",
            "0eba19589bc96aff673363b3fdc14d50", "0f10dca10c04226f25a709a66f6a8081", "0fa8f867c5c12b10c057aa93f355d037", "0fdae31bcbb7653e61dd9155aef7f4aa",
            "11674423f7c49cbe8f99fc72a9f6b1af", "119acdfe421473cd29ba11d6a4807062", "13470550fc42c140c225b220d04b0eeb", "1429a78ca65fb34946a07a1811a8c68d",
            "171f82a4464deb102a30fd33b14e99b9", "176eed14a8b829f43cebcbdfc3de3bc8", "179c3e0ba97ecbee50fce4725b191ca4", "17f63c1affcb107e2d3ca53fc5e662cd",
            "1890e3bfe29bc0f1e4635a74db0b901a", "1a397d7967f5019c680d153c484a8b39", "1a8296cb2a3240b8d4153fde0dbbf456", "1a8fcf4f479dde1b95f76704e3bebf55",
            "1bf609a2f70a3cece3d5aa7f35f328ba", "1bfe28260e28e8d3f1b1dede050d63e5", "1c44a3234b28f29b1a46d20858f16562", "1dfb993ce3ef9e4a6a326779d26c6c5f",
            "1e721a20c827a693def1e9a58066e193", "201edea37bfd914018bb4680b018838e", "206f1e21bde24b8294a814070c648c8e", "20b8c9a07d414aaa89880693f21006b5",
            "21d254dcdfb453b099c5a755005de45f", "226a5113353856577d3d2708614394f9", "241b881ae97acb48e7aad90c7a5e3255", "246b8b1cb81617739a248631519b8030",
            "256c16199bb602c4b6322b77f01f788f", "25a07ebbad18c1422e6a6caa0201b0f1", "25ec2cd3b52c34bb9800aa6880722818", "269287b480f3e60bc834b91ce19aff00",
            "26de09e8b2969782fde838e369b92328", "27688a235b0ce256b62f63bb16839487", "27d6d33835e58b5e0a457cb2ad959df4", "27edd74ebe0dc3615e473e19cb721e1d",
            "288a99bf2ca01ae5c92304b21a14016d", "28b99d12123f68221d548f98f7b355af", "28e553010d911ac92b7c298011d37c6f", "2962088b92596e536b50ba9154ec1ecc",
            "297243340065b1912784301bc074fb4e", "29ba7eecd5726df7b6a2410f0c4696f4", "2b61158bcb9c7d5da7079a009d229769", "2c2fb7730bb898c9f889ca25b90658d3",
            "2d9e0dce7a62e912821f6b6e4c616548", "2da50ea1151c344f73ebedee0f86e132", "2dd6546bf8277ee3aa3807346da875ef", "2e95cf7eceaf2522e0ac75619d12a000",
            "2eeaa3d787c7b18d03b0e775013e01e9", "2f92ddc947551888c2fb9c5b7f8ca657", "2f9bb390961aae0019cb9944c2911fe1", "308e7186b6306045830d25035211b5ed",
            "3145815bb1fadf7df923df7ebd66d1cd", "31c100cf1c4b6ed6f42b6dbd2cc705e5", "3216218e7b9ef72620042e1c1221ff3d", "3225f4cf5a57b17a82e69958bd3bdcdc",
            "329d683f59df897c609722222d22f534", "32aa360015ea644718dbbd01e2f554aa", "32c72059865da18990280bdfa7a6b9a7", "33475343cf07bf4d19385aca01e29c97",
            "348600213d0d8643c76feba83a93d7d0", "35e65f5ffbf34414965c3fa1cdc51383", "36a91806f06710e31641fa94a7ee4379", "385c4a1bde4d34bb94d26c8c468f8b9b",
            "38bd39bb1a9b717941d26ad80e22d757", "38c367b0ba940e02167d3d13e6ceaed7", "39f0679c8edfcf9628d3866d85ce97fe", "3be1df10a8013733f91eb29c97d3212c",
            "3d6a6a3db2b2dc1f4a1f36f3d534ae7d", "3d8501d11296b260c36a255dd3a7afc7", "3e07f1f6072f106e9646276a22844175", "402a4c346fa74abbbfde06c276ebf0e9",
            "4103ed587e9604b3890dddd80174a99d", "410559f95cb8e787e410fb9a43c343d9", "4137176ee6f610c220967eddf1759efd", "414f68e006684dfb06c36cfdf7d1b9d6",
            "424841570ef9aef2e20152de9567d9f9", "4295d3f2f3efdfefba3e7d2bab3bc6f4", "4428b9fc359ec17b4e3fc59870cb41d9", "44344e0f227f9a261961ab8606ef710b",
            "44414a635832163f1ff24fcf11888665", "447c867e96bf98ab86727a3e85805419", "447f7ec166c4f83afe2661a9f14bba44", "44b5d0e48f1dfa1aacfc8cf1ece15844",
            "44f2a4a3a8ef01643e936f897b279d10", "45c86182e302f19d772e85ee55cbaa05", "4642bed784ff8105b669ee9a76248c43", "46ad029fc783e3cb2d5a23afb924ad3f",
            "47e87b5524ccd4cb0a95e5886e870c64", "48606bc60c3b1f06435339a52c25b4ee", "497fd0a9acc874543a7ae0427fcc1af1", "4988c40c6ea3f6b231c6ca5d8b9dcddf",
            "4a74d1d52b024d6c9f726f5c0ebf1991", "4b76c5a3a16bc77992c056d551caea2b", "4bcc5f2e6875025eb70e99afb0099719", "4c6fb8c8775810e56704df3a0d64031d",
            "4fc3b2973770eafdad6ddddacb869430", "50f9ff2713fe915bb13bbd67dc204958", "518a0599871db62aa8e355cc19f04442", "528faddf45a505ce2dc51416b63a5304",
            "52c429cacb918a18fe275d1ce3756b89", "533f994c01db2169947a04b73f6a859c", "558a24ad6a63c59ad7908b8213976060", "56276e6f81e7475cabc98c819fe34033",
            "5641e33b17d681401731e929d97ac0f2", "56b2c2dee62702d40ed91a8fe12ecb1a", "57a5490921bb58ccc9e7bada766e4c13", "5866f766f0674f2f989f0250cef54e24",
            "5901850ba754d21fd33307232c9da33a", "5beca23fadc3d29314ab0b74dddaa291", "5c00b957ae1d34b4a3c92b571e29fb35", "5caf3ba82184111c7aa72bdfccb13fef",
            "5d8c78717559207c2951d4b2f9ad55c9", "5db2dc1757892cfc9c5b3c6de38ec36c", "5dcd594ac0a571c1072508a56ff7232f", "5e16500bf2b39ab783b46a7f1c5b8471",
            "5e25f11568478f13b19d2c504df6b54f", "5e5df277fa0f5249fe474fb115d825df", "5eb96faac4508136943f3a0c044d9abb", "5ed3ba124ec026db3764acaa5c999944",
            "6084df75178681c6367bf380a08a6b19", "60b6080605f488ae4065c46eaaff0d6e", "6115417152868f8138315f651a0b7494", "618c41e2fa046c48fd26c32d60ba1f01",
            "61de39d99ed03c8e5c1fa1bed8ab9f96", "623e8d24180d2ad9a53c06a8b0b55765", "63ca1b0e115b92bbb7f5e37f9e3c3e66", "6469634a1136015a48ee4ea7e05e676d",
            "64f976054cd116bd62bbf690f455ede3", "65aa32c3ad4f10e639e548af0f1c604b", "661c88a86d9bb46f21c8077b8bc7534e", "66863ef3381dafbb1f9e8f5d87070f41",
            "66b1bb94a2f2654ceebcdc0174ae6506", "66c40f0ec94e5b2004ebfd07e62be51d", "66e99160531ba8f4b3e5bba4b12bf106", "680b53fb117c873202a36e5f00d1998d",
            "6887f38489109057f38307d03826eea2", "6893255a96a6ceb1fbd7cfdec9ac3992", "69125edd228ffc927d9c6a317f46f129", "694171dc4d258d6e282ef952e3a2d621",
            "69b99565389d7846686c05e42949c265", "6bcdbbc875e7a8374f560b4b1cb9c1ed", "6cfb740bdf3cb66c1591e79d9ca6ccf3", "6d5c8777583c4d5b131dc2ed852069db",
            "6e8d39688b66b8e2af722cd9dc4b8226", "6eaa1f3df9213aa8148cf453764a23c9", "6ebd42740f1ea4f84899e858ea779bd9", "705fb83f0ed8850195dc67f31a2248a5",
            "706cee89924f5cd615f21abf5ade0265", "70cc7b02d6b2eceb9c3af790fada1693", "714893e0f553fb28ed5dade9f26a8d9e", "71c90284ff0e5321fa52c42c4170f90b",
            "7224c77db1e039578dc7b6655066f11b", "73d786a118a6bd54b0de0faac4074be6", "758ee8c874fafb4c9c6090cca81ec565", "75f2db60c8d47eb4c86c2fa045cb4ab3",
            "761422989aab8d8473025da9114785d5", "76291bb85d27bde72dc1c7501766cfbb", "76be879298132b948eb892182968cb64", "76d843d94ebd738df5c7bea7809235d3",
            "77203974e3ff0dad3b2aebf080f78041", "77faa45d93c8ca501b3f8db5506294c2", "7a4eaae483f69e5e0d968e2c92d83e57", "7af92eb6bce7c92fed22d9a7490b98c8",
            "7d0b90b8e11fe5629423ce126d969982", "7d5c7d2bab2936094feb6f982571a155", "803539db04ae132d962c1c2123b9a436", "80620d7578455333e81f323e40f71481",
            "8112d2dfa9b0e404304e828a783aa91c", "81d82d988740c523b64b969bf38600f5", "822bd673d7802af44f67618740d0f5e3", "82a3800d26e82081eb613ed3223e20c3",
            "82f15d303c22056e2ec5250d32afe28a", "82fb84dd8e1cf352a4957e229f76b166", "83e50355957fc25a990ecd1a3f1014c8", "857b4b1ca28cff7e3c623ec59c4a3676",
            "866ceaa0bf7b21d5c93fcb2302f84122", "8806d5b3a1d4e086d9abc9d0179db164", "890276e6f519586500599e9a28c5d18d", "891892c1f08c3d918d4b0e44552e8d65",
            "89c7e32aff4e391dc1ba0966d5ef921a", "8addbdb04cf9863c0b6604fc46e9115a", "8b03cc209e95048259318a7cce7df9ac", "8b2fd44adc4a08df1212b9e93d79d057",
            "8bd2161fb4d9b223ed3804a526909443", "8c3b701d61c8956a24145055eecc1c2a", "8cc9983e4ec5d9bd212cc926289ee21b", "8ce0731f81f66f09b8e44c9bd0be018d",
            "8ce35f621a8221937f87324d901f7732", "8e88b21eecc8df593588d4f5a7a3cb4d", "8f10beb4962165f87e87f05b3f2581e7", "900e8e19cbcb4a4e98355dd2f7ceeb5f",
            "90e510f96136c4bcd4d1b805b60c6701", "91017c7d5f77a84dd3d06918fb8b689c", "91ef4e8055a6c41463ff8f898b716c49", "92ac43c7c5bc66146aae1a99ae5d1cce",
            "92d8bf619b72e5fdd67a0802481f5567", "93f756b192758896378e188e6afe4082", "93fbaeceecdea58d526327c0b1889138", "944c82eac075bd3ad7928757df883c33",
            "946a4c6a9a3a1a85d1b23f16b84e720d", "963901aa6eac6e28da6d33ea585f877c", "96c9a32fa1e88f2b59bad81530c25fa5", "97107f91846fbc3d4c5c0b11d3efee8f",
            "976e64de88643cd381b5a4e70e50768a", "97d4f2df0acda3002bb3c1ad131d480d", "994572e18664d783264dc1fc400e62ef", "994b6075564f5297266da9a490293dd6",
            "998ffd09d820142e55f06ef7794f0ec2", "9bac20207acd31fe4d9f1db3ec8fe5fc", "9c72e4b20f68f5405d76448e0d8b57a0", "9dde95a01e0c463de6bb4589627ef111",
            "9e10057923d4e9f868e7aa80de8fc477", "9f7e0c8c03626e411973fe35564a449d", "a559be837db026bc8db9889f1c68187e", "a56105eea90bd11d3ede86baa6be07ca",
            "a5a31536d3d8613ebfbce0929758c98b", "a60fd0ec6df32844a109e55d392a8f67", "a690da31f48ba540903a4cd858b065bb", "a7ee3ab0016ce4a3557f0db2ab24be5d",
            "a8078b96585b085d19e865629bd02f70", "a85e00e5c655b6bbc3deb8dc2104a9a4", "a877df2bb60757c885c307205d666b37", "aa94338a7436108104e59a59f650174a",
            "ac3e5715344f477cc59e9f7a59247e68", "acff06e2b6dc9d641739a88fc5d6c8e4", "ad84d508e43e37d4a769aa70fc37f615", "aded31194c1cb5ff8e5eba1fd5fa2bfd",
            "ae78b8029236ecb12926f7611a1951e5", "af41485e5cbe7b4e0831bbdf8ee5ce7a", "b05154f72e03fba6db594526650269bc", "b0d2c008919d27f82a4a648880382f5e",
            "b13f3909b98f77f6d67486ea31ca0851", "b1903c1e6b413473223568bc97876456", "b1a98a6597ed7776ebedf6f5ccef02b7", "b2cc579af96ed2825bb255f48161df00",
            "b3105ef522151cd796cea905aca9c7e3", "b4344302fbd8836f8a8fd8c831c88852", "b4e531b67cf221ba101011c75646eeb1", "b5a9e36f8b688a654a754c59c76c41d9",
            "b5ab5c897a0d0de2d78f60145fc2d8d2", "b60d623daeb0d288dde7f4a11f9cd3c3", "b68b88f357c0704dd86cc91ff7627795", "b6a041111f5d9cbff9febb7bdab9f19d",
            "b6c57785240323b508f59bcbc31e24cc", "b7684c77410b8a37a37346a44294a1b3", "b8270e37556cc0fca79f16b2309c68d4", "b8cb5a28f9acb85be856b06161e851f4",
            "ba17807bfc2b79a4a2927929e05f6611", "ba3a44b990b36aa98b85fc279635eae1", "bae46b153f10418bb2e7e175ec496130", "bb63deda2bf11aa93755e9e9786fead3",
            "bcd121c1f6ed7badc11d817a14016a0b", "bcd2086c47f2eea7bef1cb59fa6e5e53", "bd009b4db493dff2b1b41ed77d47066d", "bda57c8e75df3aeb4b22053253d8671b",
            "bde161e9900e6f6970f4618680e2509c", "bf0e9af3b3544fd72366a172c0d1e36a", "bfadbcd92a7e96e33e15750438495bb0", "c01b1e81b62043143a711202a374c94f",
            "c12852d8845326ee6e41d76b8cc25dc8", "c23b36b15d0836f51492af20f6371e2c", "c26a717602f0fc66655cc22c524188ff", "c2a688ac2cfcada95e6c2f755565661a",
            "c2ef3f8afe71450f0125667cf356d7f0", "c33195d6fa9faa2ca66672117262a3e0", "c3d68aed4f8c88613386975145072e01", "c496b2049fe9d37154bbb65abf50cd56",
            "c596c9a58b997e5cab93473918fa61a2", "c5b1e9dbfb5091ec06ee4dbc344cd743", "c5f039d9ce5a131af445ad171e5768a6", "c623ef2ccf07ce5e634f477d3687e094",
            "c682ca0e03eda58cd70cad7266c0325a", "c8a7603d2a69ed4c15a4047f17cdc537", "c8d19aafaea764240e29e7e6a2036334", "c925b5791c4a72e683b762f3fd4314b6",
            "ca5b3ff6aca3d18ba341850cc1f72a56", "ca6b1cc8755a4d26d57521c8cb3f9b4e", "cc8c1db12e613b5754534afe08297e57", "ccbdd6af68b98f091a160e3c1c46f525",
            "cf3c4523e35d163dae1928ec192a68a4", "cf783964a3c61874612ea1b0d8653729", "d0016aef750f82efb358f8ad1412663e", "d0d4d5498e691a28e0a04eabbfffc99a",
            "d11300acf306de7cc33dd7324ef9c67e", "d166c19c7a35615ee44f815bf97cd51b", "d4bf847a9385949a40ac046289037b35", "d6b952a8f36515fae00bcd5b19bea451",
            "d7e1aee0d5245d96ab9fed1cbd67c961", "d7f0f949ea0333103b7b2729ed32844f", "d81cfc2e2319b8815b7b2152ffd52ae9", "d88bb8e2f571483229405f2f1c32ede9",
            "d8e3b853d079b49baed378520c3fae6b", "d92b5f13393293083332132bc9e0cab1", "d954911cbb793a1fa740d3d668bc70de", "db2f550fcf3ab795ca5784e734f5421b",
            "dc178a18c1e396f80f868ab723b09cb6", "dcc3f7ffa3cb03e86ce6566e88c112af", "dd01b23ed420a66151dd7bcbb80f5c42", "dddb9354973db3e3d52516abb2fb37a1",
            "dde67efa97f8084a9fc3d388d296f8b6", "dfcb0c97f25626242c33f981c5304d56", "e06362fd26b22b4afa75385f109aa587", "e0c974b1bc9cb55a9d421e5acadb517a",
            "e0e018e9a8afde8cc089cc175c46df3f", "e0e1244bc33da10ae1b871643d1891b0", "e202e0873efb6733de24c63b008a3563", "e26afd09939990e71a7826f024a4efcb",
            "e27f0ef31d67a3ba572306cb2dc8a1a2", "e318e869be6a0944e365fc06364763bd", "e4339441e59ae76598500692e6a2e773", "e67be4d03cafe57e0efe6ee673468f4a",
            "e728f9b4f058c4e57e620a7dd7a5b25a", "e72dd9f5c0b21c46dcc996d83a642bfa", "e84323f9d7f984cb78d96d2f1c2f0e29", "e88640f53d8ff522ca9e90db9c7161da",
            "e947da99b7ea89ef23f6eff5e92e0c78", "ea129f042e6dc219d2b2e030bbd24621", "ea2f644ff7c8e799fae810d07dcac7cf", "eab92ad458b2b8a0c8118bbfaa016159",
            "eb25783bcfbf59f0cd3a7c2f3b09fca2", "ec1000f1f749058e1b7d11f872dd65a3", "edbabfb5ff0703104eec5fb58af98b2d", "ee277245fb0115cf5c40d027cb7ec5ea",
            "f0a399cf83c2e0a5109d2eb6d8b1e81a", "f1e909ef0325293e3a6675d712fdd94e", "f26305032318cdd6e88b80e688a6fabe", "f5b2bf401a4f6c35bc33e05d1da578e8",
            "f6c4b41a3012da19d6e3aaa629266de9", "f6e6bb7141b246256d77e0da6aa0da2a", "f7f88450bacb7a6d9187ae60c02f71f8", "f8eb7b3c471b7421dafa635b17d5c1f4",
            "fa017df6aff1a2e52a8749918d98a879", "fab08dc1e8039da88be511609f76c4fa", "fafcc1805b90cc64a79ddba981b32413", "fbe988f4ac3c3260d68c2d96b38cb75e",
            "fcf825dc61c3da536fbdecb49c9e5257", "fd7e148d2a9187f46c987091084a8a0b", "fe2fed7f506f63a9db640daf4772b1b3", "ff1ebcaf374bd125f9e10e8a12148f30",
        };

        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<bool>(
                name: "is_final_quiz",
                table: "questions",
                type: "boolean",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<bool>(
                name: "is_final_quiz",
                table: "platform_module_questions",
                type: "boolean",
                nullable: false,
                defaultValue: false);

            var keys = string.Join(", ", FinalQuizKeys.Select(k => $"'{k}'"));
            migrationBuilder.Sql($@"
UPDATE platform_module_questions q SET is_final_quiz = true
WHERE md5(q.question_text || chr(31)
    || (SELECT string_agg(o.option_text, chr(30) ORDER BY o.option_text COLLATE ""C"") FROM platform_question_options o WHERE o.question_id = q.id)
    || chr(31)
    || (SELECT o.option_text FROM platform_question_options o WHERE o.question_id = q.id AND o.is_correct LIMIT 1)) IN ({keys});");

            migrationBuilder.Sql($@"
UPDATE questions q SET is_final_quiz = true
WHERE md5(q.content || chr(31)
    || (SELECT string_agg(o.content, chr(30) ORDER BY o.content COLLATE ""C"") FROM question_options o WHERE o.question_id = q.id)
    || chr(31)
    || (SELECT o.content FROM question_options o WHERE o.question_id = q.id AND o.is_correct LIMIT 1)) IN ({keys});");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "is_final_quiz",
                table: "questions");

            migrationBuilder.DropColumn(
                name: "is_final_quiz",
                table: "platform_module_questions");
        }
    }
}
