/**
 * 
 */
package com.googlecode.diskaro.library;

import java.lang.reflect.Constructor;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.util.ArrayList;
import java.util.HashMap;

import javax.swing.table.TableStringConverter;

/**
 * @author S4T4N
 * This class provides core functionality shared by tags and
 * tag-like (genre, label, etc.) library data.
 */
public abstract class TagCore extends DataCore {
	public enum ParentMode {
		DIRECT, RECURSIVE
	}
	
	//Allows sub-classes to identify their relationship db table
	protected abstract String getRelationshipTable();
	
	protected static Statements addStatements = new Statements("INSERT INTO <t0> (name) VALUES (?);");
		
	//Prepared SQL Statement for easily adding parent links - perhaps refactor to reuse Statements class logic above
	protected PreparedStatement addParentStatement = null;
	protected PreparedStatement addParentStatement() throws SQLException {
		if(addParentStatement == null) {
			addParentStatement = Library.getDB().prepareStatement("INSERT INTO "+getRelationshipTable()+" (parentID, childID) VALUES (?, ?);");
			addParentStatement.setInt(2, this.id);
		}
		return addParentStatement;
	}
	//Prepared SQL Statement for easily adding child links - as above ^
	protected PreparedStatement addChildStatement = null;
	protected PreparedStatement addChildStatement() throws SQLException {
		if(addChildStatement == null) {
			addChildStatement = Library.getDB().prepareStatement("INSERT INTO "+getRelationshipTable()+" (parentID, childID) VALUES (?, ?);");
			addChildStatement.setInt(1, this.id);
		}
		return addChildStatement;
	}
	//Prepared SQL statement for counting parents - as above ^
	protected PreparedStatement countParentsStatement = null;
	protected PreparedStatement countParentsStatement() throws SQLException {
		if(countParentsStatement == null) {
			countParentsStatement = Library.getDB().prepareStatement("SELECT count(*) AS count FROM "+getRelationshipTable()+" WHERE childID = ?;");
			countParentsStatement.setInt(1, id);
		}
		return countParentsStatement;
	}
	
	//Prepared SQL statement for fetching parents from the db - as above ^, especially for this one!
	protected PreparedStatement getParentsStatement = null;
	protected PreparedStatement getParentsStatement() throws SQLException {
		if(getParentsStatement == null) {
			getParentsStatement = Library.getDB().prepareStatement(
					"SELECT " + getTable() + ".id, name FROM " +getTable() + ", " + getRelationshipTable() + 
					" WHERE " + getRelationshipTable() + ".childID = ? AND " + getRelationshipTable() +
					".parentID = " + getTable() + ".id;");
			getParentsStatement.setInt(1, id);
		}
		return getParentsStatement;
	}
	
	//Prepared SQL statement for fetching children from the db - as above ^, especially for this one!
	protected PreparedStatement getChildrenStatement = null;
	protected PreparedStatement getChildrenStatement() throws SQLException {
		if(getChildrenStatement == null) {
			getChildrenStatement = Library.getDB().prepareStatement(
					"SELECT " + getTable() + ".id, name FROM " +getTable() + ", " + getRelationshipTable() + 
					" WHERE " + getRelationshipTable() + ".parentID = ? AND " + getRelationshipTable() +
					".childID = " + getTable() + ".id;");
			getChildrenStatement.setInt(1, id);
		}
		return getChildrenStatement;
	}
	
	/**
	 * Returns the fully qualified name of the tag/genre/etc.
	 * @return String of the fully qualified name
	 * @throws Exception
	 */
	public String getFullName() throws Exception {
		String fullName = getName();
		for(TagCore parent : getParents(ParentMode.RECURSIVE)) {
			fullName += '/' + parent.getName();
		}
		return fullName;
	}
	
	/**
	 * Returns an ArrayList of TagCore objects representing the tag/genre/etc's. parents
	 * @return ArrayList<TagCore> holding unique parent/grandparent/etc. objects
	 * @throws SQLException
	 * @throws NoSuchMethodException
	 * @throws Exception
	 */
	public ArrayList<TagCore> getParents(ParentMode mode) throws SQLException, NoSuchMethodException, Exception {
		ResultSet rs = getParentsStatement().executeQuery();
		ArrayList<TagCore> parents = new ArrayList<TagCore>(5);
		while(rs.next()) {
			TagCore parent = newInstanceByID(rs.getInt("id"));
			parents.add(parent);
		}
		if(mode == ParentMode.DIRECT) {
			return parents;
		}
		ArrayList<TagCore> grandparents = new ArrayList<TagCore>(5);
		//Load all grandparents, removing duplicates
		for(TagCore parent : parents) {
			ArrayList<TagCore> tcs = parent.getParents(ParentMode.RECURSIVE);
			grandparents.removeAll(tcs);
			grandparents.addAll(tcs);
		}
		parents.addAll(grandparents);
		return parents;
	}
	
	/**
	 * Equivalent of getParents(ParentMode.DIRECT)
	 * @see getParents(ParentMode mode)
	 * @return ArrayList<TagCore> holding parent objects
	 * @throws SQLException
	 * @throws Exception
	 */
	public ArrayList<TagCore> getParents() throws SQLException, Exception {
		return getParents(ParentMode.DIRECT);
	}
	
	/**
	 * Returns an ArrayList of TagCore objects representing the tag/genre/etc's. children
	 * @return ArrayList<TagCore> holding unique children/grandchildren/etc. objects
	 * @throws SQLException
	 * @throws NoSuchMethodException
	 * @throws Exception
	 */
	public ArrayList<TagCore> getChildren(ParentMode mode) throws SQLException, NoSuchMethodException, Exception {
		ResultSet rs = getChildrenStatement().executeQuery();
		ArrayList<TagCore> children = new ArrayList<TagCore>(5);
		while(rs.next()) {
			TagCore child = newInstanceByID(rs.getInt("id"));
			children.add(child);
		}
		if(mode == ParentMode.DIRECT) {
			return children;
		}
		ArrayList<TagCore> grandchildren = new ArrayList<TagCore>(5);
		//Load all grandchildren, removing duplicates
		for(TagCore child : children) {
			ArrayList<TagCore> tcs = child.getChildren(ParentMode.RECURSIVE);
			grandchildren.removeAll(tcs);
			grandchildren.addAll(tcs);
		}
		children.addAll(grandchildren);
		return children;
	}
	
	/**
	 * Equivalent of getChildren(ParentMode.DIRECT)
	 * @see getChildren(ParentMode mode)
	 * @return ArrayList<TagCore> holding child objects
	 * @throws SQLException
	 * @throws Exception
	 */
	public ArrayList<TagCore> getChildren() throws SQLException, Exception {
		return getChildren(ParentMode.DIRECT);
	}
	
	//Basic constructors which merely defer to DataCore
	protected TagCore(int id) throws SQLException {
		super(id);
	}
	
	protected TagCore(String name) throws SQLException {
		super(name);
	}
	
	//Adds a new tag/genre/etc. to the database
	protected static int add(String name, String table) throws SQLException {
		PreparedStatement ps = addStatements.fetch(table);
		ps.setString(1, name);
		ps.executeUpdate();
		return ps.getGeneratedKeys().getInt(1);
	}
	
	/**
	 * Adds a parent reference to the tag/genre/etc. to the database
	 * @param parent uid of the parent tag/etc.
	 * @throws Exception
	 */
	public void addParent(int parent) throws Exception {
		addParent(newInstanceByID(parent));
	}
	
	/**
	 * Adds a parent reference to the tag/genre/etc. to the database
	 * @param parent human name of the parent tag/etc.
	 * @throws Exception
	 */
	public void addParent(String parent) throws Exception {
		addParent(newInstanceByName(parent));
	}
	
	/**
	 * Adds a parent reference to the tag/genre/etc.
	 * @param parent TagCore (or sub-class) object representing the parent tag/genre/etc.
	 * @throws SQLException
	 */
	public void addParent(TagCore parent) throws SQLException {
		//check exact sub-class matches or throw
		addParentStatement().setInt(1, parent.getID());
		addParentStatement().executeUpdate();
	}
	
	/**
	 * Adds a child reference to the tag/genre/etc.
	 * @param child TagCore (or sub-class) object representing the child tag/genre/etc.
	 * @throws SQLException
	 */
	public void addChild(TagCore child) throws SQLException {
		//check exact sub-class matches or throw
		addChildStatement().setInt(2, child.getID());
		addChildStatement().executeUpdate();
	}
	
	//Returns the id-based constructor of the calling subclass - may not be needed?
	protected Constructor<?> getIDConstructor() throws NoSuchMethodException {
		return getClass().getConstructor(int.class);
	}
		
	//Returns the name-based constructor of the calling subclass - as above ^
	protected Constructor<?> getNameConstructor() throws NoSuchMethodException {
		return getClass().getConstructor(String.class);
	}
	
	//Returns a new instance of the calling SUB-class by id
	protected TagCore newInstanceByID(int id) throws Exception {
		return getClass().getConstructor(int.class).newInstance(id);
	}
	
	//Returns a new instance of the calling SUB-class by name
	protected TagCore newInstanceByName(String name) throws Exception {
		return getClass().getConstructor(String.class).newInstance(name);
	}
}
