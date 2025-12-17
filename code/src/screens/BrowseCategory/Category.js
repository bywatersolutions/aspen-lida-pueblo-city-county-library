import { Button, ButtonGroup, ButtonIcon, ButtonText, FlatList, View, HStack, Pressable, Text, SafeAreaView, Box, Badge, BadgeText } from '@gluestack-ui/themed';
import { ScrollView } from 'react-native';
import _ from 'lodash';
import React from 'react';

import { LanguageContext, LibrarySystemContext, ThemeContext } from '../../context/initialContext';
import { getTermFromDictionary } from '../../translations/TranslationService';
import { Image } from 'expo-image';

const DisplayBrowseCategory = (props) => {
     const category = props.category;
     const subCategories = category.subCategories ?? [];
     const records = category.records ?? [];

     const [selectedSubCategoryIndex, setSelectedSubCategoryIndex] = React.useState(0);

     const handleSelectSubCategory = (index) => setSelectedSubCategoryIndex(index);

     const showSubCategoryRecords =
          subCategories.length > 0 && subCategories[selectedSubCategoryIndex]?.records?.length > 0;

     const maxItems = 7;

     const hasMore = records.length > maxItems;
     const displayedData = hasMore ? records.slice(0, maxItems) : records;

     let subCategoryRecords = [];
     let subCategoryHasMore = false;
     if (showSubCategoryRecords) {
          const allRecords = subCategories[selectedSubCategoryIndex].records;
          subCategoryHasMore = allRecords.length > maxItems;
          subCategoryRecords = subCategoryHasMore ? allRecords.slice(0, maxItems) : allRecords;
     }

     return (
          <SafeAreaView>
               <View>
                    <HStack space="$3" alignItems="center" justifyContent="space-between">
                         <DisplayBrowseCategoryTitle category={category.label} id={category.textId} />
                    </HStack>
                    {subCategories.length > 0 ? (
                         <>
                         <ScrollView horizontal>
                              <DisplaySubCategoryBar subCategories={subCategories} selectedIndex={selectedSubCategoryIndex}
                                                     onSelect={handleSelectSubCategory} />
                         </ScrollView>
                         {showSubCategoryRecords && (
                              <FlatList
                                   pb="$8"
                                   data={subCategoryRecords}
                                   keyExtractor={(item, index) => item.key?.toString() ?? index.toString()}
                                   horizontal
                                   renderItem={({ item }) => (
                                        <DisplayBrowseCategoryRecord record={item} />
                                   )}
                                   ListFooterComponent={subCategoryHasMore ? <DisplayMoreResultsButton /> : null}
                              />
                         )}
                         </>
                    ) : records.length > 0 ? (
                         <FlatList
                              pb="$8"
                              data={displayedData}
                              keyExtractor={(item, index) => item.id?.toString() ?? index.toString()}
                              horizontal
                              renderItem={({ item }) => (
                                   <DisplayBrowseCategoryRecord record={item} />
                              )}
                              ListFooterComponent={hasMore ? <DisplayMoreResultsButton /> : null}
                         />
                    ) : null}
               </View>
          </SafeAreaView>
     );
};

const DisplayBrowseCategoryTitle = ({category, id}) => {
     return (
          <Text
               bold
               maxWidth="80%"
               mb="$1"
               sx={{
               '@base': {
                    fontSize: 16,
               },
               '@lg': {
                    fontSize: 22,
               },
          }}>
               {category}
          </Text>
     );
}

const DisplayBrowseCategoryRecord = ({record}) => {
     const { library } = React.useContext(LibrarySystemContext);
     const { theme, textColor, colorMode } = React.useContext(ThemeContext);
     const { language } = React.useContext(LanguageContext);

     let type = 'grouped_work';
     if (!_.isUndefined(record.source)) {
          if (record.source === 'library_calendar' || record.source === 'springshare_libcal' || record.source === 'communico' || record.source === 'assabet') {
               type = 'Event';
          } else {
               type = record.source;
          }
     }

     if (!_.isUndefined(record.recordtype)) {
          type = record.recordtype;
     }

     let id = record.key ?? record.id;
     if (type === 'Event') {
          if (_.includes(id, 'lc_')) {
               type = 'library_calendar_event';
          }
          if (_.includes(id, 'libcal_')) {
               type = 'springshare_libcal_event';
          }
          if (_.includes(id, 'communico_')) {
               type = 'communico_event';
          }
          if (_.includes(id, 'assabet_')) {
               type = 'assabet_event';
          }
          if (_.includes(id, 'aspenEvent_')) {
               type = 'aspenEvent_event';
          }
     }

     if(type !== 'aspenEvent_event') {
          type = type.toLowerCase();
     }

     const blurhash = 'MHPZ}tt7*0WC5S-;ayWBofj[K5RjM{ofM_';
     const imageUrl = library.baseUrl + '/bookcover.php?id=' + id + '&size=medium&type=' + type;

     let isNew = false;
     if (typeof record.isNew !== 'undefined') {
          isNew = record.isNew;
     }

     return (
          <Pressable
               ml="$1"
               mr="$3"
               sx={{
                    '@base': {
                         width: 100,
                         height: 150,
                    },
                    '@lg': {
                         width: 180,
                         height: 250,
                    },
               }}>
               <Image
                    alt={record.title_display ?? record.title}
                    source={imageUrl}
                    style={{
                         width: '100%',
                         height: '100%',
                         borderRadius: 4,
                    }}
                    placeholder={blurhash}
                    transition={1000}
                    contentFit="cover"
               />
               {isNew ? (
                    <Box zIndex={1} alignItems="center">
                         <Badge bgColor={theme['colors']['warning']['500']} mx={5} mt={-8}>
                              <BadgeText bold color={theme['colors']['white']} textTransform="none">
                                   {getTermFromDictionary(language, 'flag_new')}
                              </BadgeText>
                         </Badge>
                    </Box>
               ) : null}
          </Pressable>
     )
}

const DisplaySubCategoryBar = ({ subCategories, selectedIndex, onSelect }) => {
     const { theme, textColor, colorMode } = React.useContext(ThemeContext);

     return (
         <ButtonGroup vertical space="sm" pb="$2">
                {subCategories.map((subCategory, index) => (
                     <Button size="xs" key={index} variant={selectedIndex === index ? 'solid' : 'outline'}
                             onPress={() => onSelect(index)}>
                          <ButtonText fontWeight="$medium">
                               {subCategory.label}
                          </ButtonText>
                     </Button>
                ))}
         </ButtonGroup>
     )
}

const DisplayMoreResultsButton = ({ onPress }) => {
     const { theme, textColor, colorMode } = React.useContext(ThemeContext);

     return (
          <Pressable
               ml="$1"
               alignItems="center"
               justifyContent="center"
               mr="$3"
               bgColor={theme['colors']['primary']['100']}
               style={{
                    borderRadius: 4,
               }}
               sx={{
                    '@base': {
                         width: 100,
                         height: 150,
                    },
                    '@lg': {
                         width: 180,
                         height: 250,
                    },
               }}>
               <Text bold>More</Text>
          </Pressable>
     )
}

export default DisplayBrowseCategory;