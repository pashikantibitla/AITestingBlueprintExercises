package stringsPractice;

public class GetUnicodePointOfGivenString {

	public static void main(String[] args) 
	{
		//a program to get the character (Unicode code point) at the given index within the String
		String str="w3resource.com";
		System.out.println("Given String is: "+str);
		char[] chr=str.toCharArray();
		
		for(int i=0;i<chr.length;i++)
		{
			int l=str.codePointAt(i);
			System.out.println("the char at index "+i+" is "+l);
		}
	}
}
